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

type Tab = "objectives" | "shop" | "weapons" | "news";

export default function FortniteApp() {
  const [activeTab, setActiveTab] = useState<Tab>("objectives");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<QuestCategory | "all" | "favorites" | "completed">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [shopSource, setShopSource] = useState<"live" | "offline" | null>(null);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopError, setShopError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [shopFilter, setShopFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState<FortniteNews[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // Load persisted state
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
      setShopSource(result.source as "live" | "offline");
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

  const filteredQuests = useMemo(() => {
    return QUESTS.filter((q) => {
      const matchesSearch =
        !search ||
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
    });
  }, [search, activeCategory, favorites, completed]);

  const filteredShop = useMemo(() => {
    if (shopFilter === "all") return shopItems;
    if (shopFilter === "favorites") return shopItems.filter((i) => favorites.has(i.id));
    return shopItems.filter((item) => item.type === shopFilter);
  }, [shopItems, shopFilter, favorites]);

  const questCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: QUESTS.length,
      favorites: favorites.size,
      completed: completed.size,
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

  const TABS: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "objectives", label: "اهداف", icon: "🎯", badge: newQuestCount },
    { key: "shop",       label: "آیتم‌شاپ", icon: "🛒" },
    { key: "weapons",    label: "سلاح‌ها", icon: "⚔️" },
    { key: "news",       label: "اخبار", icon: "📢" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0e1a", fontFamily: "'Vazirmatn', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: "rgba(10,14,26,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1f2937" }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                style={{ background: "linear-gradient(135deg, #00d4ff, #8b5cf6)" }}>
                🎮
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-sm leading-tight"
                  style={{ background: "linear-gradient(135deg, #00d4ff, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  فورتنایت
                </div>
                <div className="text-xs text-gray-500">فصل ۲ · فصل ۷</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-xl p-1 flex-1 min-w-0" style={{ background: "#111827" }}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 justify-center"
                  style={activeTab === tab.key
                    ? { background: "#1f2937", color: "#fff" }
                    : { color: "#6b7280" }}>
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center font-bold"
                      style={{ background: "#ef4444", color: "#fff", fontSize: "9px" }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Refresh + Timer */}
            <div className="flex items-center gap-2 shrink-0">
              <ShopTimer />
              <button
                onClick={() => { loadShop(true); if (activeTab === "news") loadNews(); }}
                disabled={refreshing || shopLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: "#00d4ff15", border: "1px solid #00d4ff40", color: refreshing ? "#6b7280" : "#00d4ff" }}>
                <span className={refreshing ? "animate-spin" : ""}>🔄</span>
                <span className="hidden sm:inline">{refreshing ? "..." : "بروزرسانی"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ── OBJECTIVES ── */}
        {activeTab === "objectives" && (
          <div className="space-y-5">
            <SearchBar value={search} onChange={setSearch} />
            <CategoryFilter
              activeCategory={activeCategory}
              onChange={setActiveCategory}
              counts={questCounts}
              favoritesCount={favorites.size}
              completedCount={completed.size}
            />

            {/* XP Progress */}
            <div className="rounded-xl p-4" style={{ background: "#111827", border: "1px solid #1f2937" }}>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-400">XP کسب‌شده از نمایش فعلی</span>
                <span className="font-bold" style={{ color: "#ffd700" }}>
                  {earnedXp.toLocaleString("fa-IR")} / {totalXp.toLocaleString("fa-IR")} XP
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: totalXp > 0 ? `${(earnedXp / totalXp) * 100}%` : "0%" }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{filteredQuests.length} هدف نمایش داده‌شده</span>
                <span>{completed.size} انجام شده از {QUESTS.length}</span>
              </div>
            </div>

            {filteredQuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-lg font-medium">نتیجه‌ای یافت نشد</p>
                <p className="text-sm mt-1">جستجو یا فیلتر دیگری را امتحان کنید</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-white">آیتم‌شاپ امروز</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  {lastUpdated && (
                    <p className="text-xs text-gray-400">
                      آخرین بروزرسانی: {lastUpdated.toLocaleTimeString("fa-IR")}
                    </p>
                  )}
                  {shopSource && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={shopSource === "live"
                        ? { background: "#052e16", color: "#22c55e", border: "1px solid #22c55e40" }
                        : { background: "#450a0a", color: "#ef4444", border: "1px solid #ef444440" }}>
                      {shopSource === "live" ? "🟢 لایو" : "📦 آفلاین"}
                    </span>
                  )}
                </div>
              </div>
              {shopItems.length > 0 && (
                <span className="text-sm text-gray-400">
                  <span className="text-white font-bold">{filteredShop.length}</span> آیتم
                </span>
              )}
            </div>

            {/* Filter tabs */}
            {shopItems.length > 0 && (
              <div className="tabs-scroll flex gap-2 pb-1">
                {shopTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setShopFilter(type)}
                    className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={shopFilter === type
                      ? { background: "linear-gradient(135deg, #00d4ff, #8b5cf6)", color: "#000", fontWeight: 700 }
                      : { background: "#111827", border: "1px solid #1f2937", color: "#6b7280" }}>
                    {type === "all" ? "همه" : type === "favorites" ? `⭐ علاقه‌مندی‌ها (${favorites.size})` : translateType(type)}
                  </button>
                ))}
              </div>
            )}

            {shopLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-xl shimmer" style={{ aspectRatio: "3/4" }} />
                ))}
              </div>
            ) : shopError ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-5xl mb-4">⚠️</span>
                <p className="text-lg font-medium">خطا در بارگذاری</p>
                <button onClick={() => loadShop()} className="btn-fortnite mt-4">تلاش مجدد</button>
              </div>
            ) : filteredShop.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-5xl mb-4">🛒</span>
                <p>آیتمی یافت نشد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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

            {/* Live shop link */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-gray-800">
              <a
                href="https://fortnite.gg/shop"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: "linear-gradient(135deg,#00d4ff,#8b5cf6)", color: "#000" }}>
                🛒 مشاهده شاپ زنده در fortnite.gg
              </a>
              {shopSource === "offline" && (
                <span className="text-xs text-gray-500">
                  آیتم‌های نمایش‌داده‌شده نمونه هستند — برای شاپ واقعی روز کلیک کنید
                </span>
              )}
              <span className="text-xs text-gray-700 mr-auto hidden sm:block">
                داده از <a href="https://fortnite-api.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">fortnite-api.com</a>
              </span>
            </div>
          </div>
        )}

        {/* ── WEAPONS ── */}
        {activeTab === "weapons" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">سلاح‌های فصل ۲ فصل ۷</h2>
              <p className="text-sm text-gray-400 mt-1">رتبه‌بندی بر اساس meta فعلی · آمار بولت‌استاندارد</p>
            </div>
            <div className="flex gap-4 text-xs flex-wrap">
              {(["S","A","B","C","D"] as const).map((tier) => (
                <div key={tier} className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded flex items-center justify-center font-bold text-sm"
                    style={{ background: `${getTierBg(tier)}`, color: getTierColor(tier) }}>
                    {tier}
                  </span>
                  <span className="text-gray-400">{getTierLabel(tier)}</span>
                </div>
              ))}
            </div>
            <WeaponsSection />
          </div>
        )}

        {/* ── NEWS ── */}
        {activeTab === "news" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">اخبار فورتنایت</h2>
                <p className="text-sm text-gray-400 mt-1">آخرین رویدادها و به‌روزرسانی‌ها</p>
              </div>
              <button onClick={loadNews} disabled={newsLoading}
                className="text-sm px-3 py-2 rounded-lg transition-all"
                style={{ background: "#111827", border: "1px solid #1f2937", color: newsLoading ? "#6b7280" : "#00d4ff" }}>
                {newsLoading ? "..." : "🔄 بروزرسانی"}
              </button>
            </div>
            <NewsSection news={news} loading={newsLoading} />
            <div className="text-center text-xs text-gray-600 pt-2 border-t border-gray-800">
              اخبار از <a href="https://fortnite-api.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">fortnite-api.com</a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getTierColor(tier: string): string {
  const c: Record<string, string> = { S: "#ffd700", A: "#22c55e", B: "#3b82f6", C: "#f59e0b", D: "#6b7280" };
  return c[tier] ?? "#6b7280";
}
function getTierBg(tier: string): string {
  const c: Record<string, string> = { S: "#ffd70015", A: "#22c55e15", B: "#3b82f615", C: "#f59e0b15", D: "#6b728015" };
  return c[tier] ?? "#6b728015";
}
function getTierLabel(tier: string): string {
  const c: Record<string, string> = { S: "بی‌نظیر", A: "عالی", B: "خوب", C: "متوسط", D: "ضعیف" };
  return c[tier] ?? "";
}
