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
import QuestCard from "./QuestCard";
import ShopItemCard from "./ShopItemCard";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import ShopTimer from "./ShopTimer";
import WeaponsSection from "./WeaponsSection";
import NewsSection from "./NewsSection";
import MapSection from "./MapSection";
import CosmeticsSection from "./CosmeticsSection";
import JamTracksSection from "./JamTracksSection";
import GuidesSection from "./GuidesSection";
import ServerStatus from "./ServerStatus";

type Tab = "objectives" | "shop" | "weapons" | "news" | "map" | "cosmetics" | "jamtracks" | "guides";

const TAB_DEFS: { key: Tab; label: string; icon: string }[] = [
  { key: "objectives", label: "اهداف",    icon: "🎯" },
  { key: "shop",       label: "شاپ",      icon: "🛒" },
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
  const totalXp = filteredQuests.reduce((s, q) => s + q.xpReward, 0);
  const earnedXp = filteredQuests.filter((q) => completed.has(q.id)).reduce((s, q) => s + q.xpReward, 0);

  const currentTab = TAB_DEFS.find((t) => t.key === activeTab)!;
  const isRefreshable = refreshing || shopLoading;

  const handleRefresh = () => {
    loadShop(true);
    if (activeTab === "news") loadNews();
  };

  return (
    <div style={{ background: "var(--c-base)", minHeight: "100dvh" }}>
      {/* ══ HEADER ══════════════════════════════════════════════════ */}
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
          {/* Logo */}
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

          {/* Desktop tab bar */}
          <div className="tab-bar hidden md:flex" style={{ flex: 1 }}>
            {TAB_DEFS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.key === "objectives" && newQuestCount > 0 && (
                  <span className="tab-badge">{newQuestCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile: current tab name */}
          <div className="flex-1 text-center md:hidden">
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>
              {currentTab.icon} {currentTab.label}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div className="hidden sm:block">
              <ServerStatus />
            </div>
            <div className="hidden sm:block">
              <ShopTimer />
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshable}
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

      {/* ══ MAIN CONTENT ════════════════════════════════════════════ */}
      <main className="main-content">

        {/* ── OBJECTIVES ── */}
        {activeTab === "objectives" && (
          <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <SearchBar value={search} onChange={setSearch} />
            <CategoryFilter
              activeCategory={activeCategory}
              onChange={setActiveCategory}
              counts={questCounts}
              favoritesCount={favorites.size}
              completedCount={completed.size}
            />

            {/* XP progress card */}
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 13, color: "var(--c-muted)" }}>پیشرفت XP در نمایش فعلی</span>
                <span className="text-gold" style={{ fontWeight: 800, fontSize: 14 }}>
                  {earnedXp.toLocaleString("fa-IR")} / {totalXp.toLocaleString("fa-IR")} XP
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: totalXp > 0 ? `${(earnedXp / totalXp) * 100}%` : "0%" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "var(--c-dim)" }}>
                <span>{filteredQuests.length} هدف نمایش‌داده‌شده</span>
                <span>{completed.size} انجام‌شده از {QUESTS.length}</span>
              </div>
            </div>

            {filteredQuests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--c-muted)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>نتیجه‌ای یافت نشد</p>
                <p style={{ fontSize: 13, color: "var(--c-dim)" }}>جستجو یا فیلتر دیگری را امتحان کنید</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                {filteredQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    isFavorite={favorites.has(quest.id)}
                    isCompleted={completed.has(quest.id)}
                    onToggleFavorite={toggleFavorite}
                    onToggleComplete={toggleComplete}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SHOP ── */}
        {activeTab === "shop" && (
          <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 className="section-title">آیتم‌شاپ امروز</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                  {lastUpdated && (
                    <span style={{ fontSize: 12, color: "var(--c-dim)" }}>
                      {lastUpdated.toLocaleTimeString("fa-IR")}
                    </span>
                  )}
                  {shopSource && (
                    <span className={`badge ${shopSource === "live" ? "pill-live" : shopSource === "cache" ? "pill-live" : "pill-offline"}`}>
                      {shopSource === "live" ? "🟢 لایو" : shopSource === "cache" ? "⚡ کش" : "📦 آفلاین"}
                    </span>
                  )}
                </div>
              </div>
              {shopItems.length > 0 && (
                <span style={{ fontSize: 13, color: "var(--c-muted)" }}>
                  <strong style={{ color: "var(--c-text)" }}>{filteredShop.length}</strong> آیتم
                </span>
              )}
            </div>

            {/* Type filter */}
            {shopItems.length > 0 && (
              <div className="tabs-scroll" style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
                {shopTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setShopFilter(type)}
                    className={`filter-chip${shopFilter === type ? " active" : ""}`}
                  >
                    {type === "all" ? "همه" : type === "favorites"
                      ? `⭐ علاقه‌مندی (${favorites.size})`
                      : translateType(type)}
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            {shopLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{
                    position: "relative", aspectRatio: "3/4", borderRadius: 14,
                    background: "#090e1f", overflow: "hidden",
                  }}>
                    <div className="shimmer" style={{ position: "absolute", inset: 0 }} />
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      padding: "8px 10px 10px",
                      background: "linear-gradient(to bottom, transparent, rgba(5,8,16,0.95))",
                      display: "flex", flexDirection: "column", gap: 5,
                    }}>
                      <div style={{ height: 11, borderRadius: 4, background: "rgba(255,255,255,0.07)", width: "80%" }} />
                      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)", width: "45%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : shopError ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--c-muted)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>خطا در بارگذاری</p>
                <button onClick={() => loadShop()} className="btn btn-primary">تلاش مجدد</button>
              </div>
            ) : filteredShop.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--c-muted)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                <p>آیتمی یافت نشد</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
                {filteredShop.map((item) => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    isFavorite={favorites.has(item.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, borderTop: "1px solid var(--c-border)", flexWrap: "wrap" }}>
              <a
                href="https://fortnite.gg/shop"
                target="_blank" rel="noopener"
                className="btn btn-gradient"
              >
                🛒 شاپ زنده در fortnite.gg
              </a>
              {shopSource === "offline" && (
                <span style={{ fontSize: 12, color: "var(--c-dim)" }}>
                  آیتم‌های نمایشی نمونه هستند
                </span>
              )}
              <span style={{ fontSize: 12, color: "var(--c-dim)", marginRight: "auto" }}>
                داده از{" "}
                <a href="https://fortnite-api.com" target="_blank" rel="noopener"
                  style={{ color: "var(--c-blue)", textDecoration: "none" }}>
                  fortnite-api.com
                </a>
              </span>
            </div>
          </div>
        )}

        {/* ── WEAPONS ── */}
        {activeTab === "weapons" && (
          <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 className="section-title">سلاح‌های فصل ۲ فصل ۷</h2>
              <p className="section-sub">رتبه‌بندی بر اساس meta فعلی · آمار بولت‌استاندارد</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {(["S","A","B","C","D"] as const).map((tier) => (
                <div key={tier} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 7,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13,
                    background: `${TIER_BG[tier]}`, color: TIER_COLOR[tier],
                    border: `1px solid ${TIER_COLOR[tier]}30`,
                  }}>
                    {tier}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--c-muted)" }}>{TIER_LABEL[tier]}</span>
                </div>
              ))}
            </div>
            <WeaponsSection />
          </div>
        )}

        {/* ── NEWS ── */}
        {activeTab === "news" && (
          <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">اخبار فورتنایت</h2>
                <p className="section-sub">آخرین رویدادها و به‌روزرسانی‌ها</p>
              </div>
              <button onClick={loadNews} disabled={newsLoading} className="btn btn-ghost">
                {newsLoading ? "..." : "🔄 بروزرسانی"}
              </button>
            </div>
            <NewsSection news={news} loading={newsLoading} />
            <div style={{ textAlign: "center", fontSize: 12, color: "var(--c-dim)", paddingTop: 8, borderTop: "1px solid var(--c-border)" }}>
              اخبار از{" "}
              <a href="https://fortnite-api.com" target="_blank" rel="noopener" style={{ color: "var(--c-blue)" }}>
                fortnite-api.com
              </a>
            </div>
          </div>
        )}

        {/* ── MAP ── */}
        {activeTab === "map" && (
          <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 className="section-title">نقشه فورتنایت</h2>
              <p className="section-sub">مناطق نقشه · رتبه‌بندی لوت · جستجوی منطقه</p>
            </div>
            <MapSection />
          </div>
        )}

        {/* ── COSMETICS ── */}
        {activeTab === "cosmetics" && (
          <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 className="section-title">مجموعه اسکین‌ها</h2>
              <p className="section-sub">همه آیتم‌های فورتنایت · علامت‌گذاری موارد دارم</p>
            </div>
            <CosmeticsSection />
          </div>
        )}

        {/* ── JAM TRACKS ── */}
        {activeTab === "jamtracks" && (
          <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 className="section-title">جم‌ترک‌های فستیوال</h2>
              <p className="section-sub">آهنگ‌های موجود در Fortnite Festival · سختی ابزار</p>
            </div>
            <JamTracksSection />
          </div>
        )}

        {/* ── GUIDES ── */}
        {activeTab === "guides" && (
          <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 className="section-title">راهنمای بازی</h2>
              <p className="section-sub">V-Bucks · مودها · کدهای تمرین · نکات حرفه‌ای</p>
            </div>
            <GuidesSection />
          </div>
        )}
      </main>

      {/* ══ MOBILE BOTTOM NAV ════════════════════════════════════════ */}
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
    </div>
  );
}

const TIER_COLOR: Record<string, string> = { S: "#f0b429", A: "#22c55e", B: "#3b82f6", C: "#f97316", D: "#6b7280" };
const TIER_BG:    Record<string, string> = { S: "#f0b42912", A: "#22c55e12", B: "#3b82f612", C: "#f9731612", D: "#6b728012" };
const TIER_LABEL: Record<string, string> = { S: "بی‌نظیر", A: "عالی", B: "خوب", C: "متوسط", D: "ضعیف" };
