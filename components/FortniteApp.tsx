"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Quest, QuestCategory, ShopItem } from "@/types";
import { QUESTS, QUEST_CATEGORIES } from "@/lib/questData";
import {
  fetchItemShop,
  fetchFortniteNews,
  translateType,
  FortniteNews,
} from "@/lib/fortniteApi";
import ErrorBoundary from "./ErrorBoundary";
import TabBar from "./TabBar";
import ObjectivesTab from "./ObjectivesTab";
import ShopTab from "./ShopTab";
import NewsTab from "./NewsTab";
import MapTab from "./MapTab";
import CosmeticsTab from "./CosmeticsTab";
import JamTracksTab from "./JamTracksTab";
import PatchNotesTab from "./PatchNotesTab";
import StatsTab from "./StatsTab";
import GuidesTab from "./GuidesTab";
import UpcomingTab from "./UpcomingTab";
import WeaponsTab from "./WeaponsTab";
import ServerStatus from "./ServerStatus";
import ShopTimer from "./ShopTimer";

type Tab = "objectives" | "shop" | "weapons" | "news" | "map" | "cosmetics" | "jamtracks" | "guides" | "upcoming" | "stats" | "patchnotes";

const TAB_DEFS: { key: Tab; label: string; icon: string }[] = [
  { key: "objectives", label: "اهداف",    icon: "🎯" },
  { key: "shop",       label: "شاپ",      icon: "🛒" },
  { key: "upcoming",   label: "لیک‌ها",   icon: "🔮" },
  { key: "stats",      label: "آمار",     icon: "📊" },
  { key: "patchnotes", label: "پچ‌نوت",   icon: "📋" },
  { key: "weapons",    label: "سلاح‌ها",  icon: "⚔️" },
  { key: "news",       label: "اخبار",    icon: "📢" },
  { key: "map",        label: "نقشه",     icon: "🗺️" },
  { key: "cosmetics",  label: "اسکین‌ها", icon: "🎨" },
  { key: "jamtracks",  label: "موزیک",    icon: "🎵" },
  { key: "guides",     label: "راهنما",   icon: "💡" },
];

export default function FortniteApp() {
  const [activeTab, setActiveTab] = useState<Tab>("objectives");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<QuestCategory | "all" | "favorites" | "completed">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [shopSource, setShopSource] = useState<"live" | "offline" | "cache" | null>(null);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopError, setShopError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [shopFilter, setShopFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState<FortniteNews[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    try {
      const fav = localStorage.getItem("fn-favorites");
      if (fav) setFavorites(new Set(JSON.parse(fav)));
      const comp = localStorage.getItem("fn-completed");
      if (comp) setCompleted(new Set(JSON.parse(comp)));
    } catch {}
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem("fn-favorites", JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem("fn-completed", JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const loadShop = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setShopLoading(true);
    setShopError(false);
    try {
      const result = await fetchItemShop();
      setShopItems(result.items);
      setShopSource(result.source as "live" | "offline" | "cache");
      setLastUpdated(new Date());
    } catch {
      setShopError(true);
    } finally {
      setShopLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const data = await fetchFortniteNews();
      setNews(data);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => { loadShop(); }, [loadShop]);
  useEffect(() => {
    if (activeTab === "news" && news.length === 0) loadNews();
  }, [activeTab, news.length, loadNews]);

  const filteredQuests = useMemo(() => QUESTS.filter((q) => {
    const matchesSearch = !search ||
      q.titleFa.includes(search) ||
      q.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      q.descriptionFa.includes(search) ||
      q.tags.some((t) => t.includes(search.toLowerCase()));
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "favorites" && favorites.has(q.id)) ||
      (activeCategory === "completed" && completed.has(q.id)) ||
      q.category === activeCategory;
    return matchesSearch && matchesCategory;
  }), [search, activeCategory, favorites, completed]);

  const filteredShop = useMemo(() => {
    if (shopFilter === "all") return shopItems;
    if (shopFilter === "favorites") return shopItems.filter((i) => favorites.has(i.id));
    return shopItems.filter((item) => item.type === shopFilter);
  }, [shopItems, shopFilter, favorites]);

  const questCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: QUESTS.length, favorites: favorites.size, completed: completed.size,
    };
    for (const cat of Object.keys(QUEST_CATEGORIES)) {
      counts[cat] = QUESTS.filter((q) => q.category === cat).length;
    }
    return counts;
  }, [favorites.size, completed.size]);

  const shopTypes = useMemo(() => {
    const types = new Set(shopItems.map((i) => i.type));
    return ["all", "favorites", ...Array.from(types)];
  }, [shopItems]);

  const newQuestCount = QUESTS.filter((q) => q.isNew).length;

  const handleRefresh = () => {
    loadShop(true);
    if (activeTab === "news") loadNews();
  };

  const renderTab = () => {
    switch (activeTab) {
      case "objectives":
        return (
          <ObjectivesTab
            quests={QUESTS}
            search={search}
            onSearchChange={setSearch}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            favorites={favorites}
            completed={completed}
            onToggleFavorite={toggleFavorite}
            onToggleComplete={toggleComplete}
          />
        );
      case "shop":
        return (
          <ShopTab
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case "weapons":
        return <WeaponsTab />;
      case "news":
        return <NewsTab />;
      case "map":
        return <MapTab />;
      case "cosmetics":
        return <CosmeticsTab />;
      case "jamtracks":
        return <JamTracksTab />;
      case "patchnotes":
        return <PatchNotesTab />;
      case "stats":
        return <StatsTab />;
      case "guides":
        return <GuidesTab />;
      case "upcoming":
        return <UpcomingTab />;
      default:
        return null;
    }
  };

  return (
    <div style={{ background: "var(--c-base)", minHeight: "100dvh" }}>
      <ErrorBoundary>
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(5,7,15,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--c-border)",
          height: "var(--header-h)",
        }}>
          <div style={{
            maxWidth: 1400, margin: "0 auto",
            padding: "0 16px", height: "100%",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, #00c9f5, #7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, boxShadow: "0 0 16px rgba(0,201,245,0.25)",
              }}>
                🎮
              </div>
              <div className="hidden sm:block">
                <div className="text-gradient" style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>
                  فورتنایت
                </div>
                <div style={{ fontSize: 10, color: "var(--c-dim)" }}>فصل ۲ · فصل ۷</div>
              </div>
            </div>

            <TabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              newQuestCount={newQuestCount}
            />

            <div className="flex-1 text-center md:hidden">
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>
                {TAB_DEFS.find((t) => t.key === activeTab)?.icon} {TAB_DEFS.find((t) => t.key === activeTab)?.label}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div className="hidden sm:block">
                <ServerStatus />
              </div>
              <div className="hidden sm:block">
                <ShopTimer />
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing || shopLoading}
                className="btn-icon"
                title="بروزرسانی"
              >
                <span style={{
                  fontSize: 16,
                  display: "inline-block",
                  animation: refreshing ? "spin 0.7s linear infinite" : "none",
                }}>
                  🔄
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="main-content">
          <ErrorBoundary>
            {renderTab()}
          </ErrorBoundary>
        </main>

        <nav className="bottom-nav md:hidden">
          {TAB_DEFS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`bottom-nav-btn${activeTab === tab.key ? " active" : ""}`}
            >
              <span className="bn-icon">{tab.icon}</span>
              <span className="bn-label">{tab.label}</span>
              {tab.key === "objectives" && newQuestCount > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: "50%", transform: "translateX(8px)",
                  background: "#ef4444", color: "#fff",
                  fontSize: 8, fontWeight: 800,
                  padding: "1px 4px", borderRadius: 999,
                  lineHeight: "1.4",
                }}>
                  {newQuestCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </ErrorBoundary>
    </div>
  );
}

const TIER_COLOR: Record<string, string> = { S: "#f0b429", A: "#22c55e", B: "#3b82f6", C: "#f97316", D: "#6b7280" };
const TIER_BG:    Record<string, string> = { S: "#f0b42912", A: "#22c55e12", B: "#3b82f612", C: "#f9731612", D: "#6b728012" };
const TIER_LABEL: Record<string, string> = { S: "بی‌نظیر", A: "عالی", B: "خوب", C: "متوسط", D: "ضعیف" };