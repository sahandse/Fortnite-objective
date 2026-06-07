"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Quest, QuestCategory, ShopItem } from "@/types";
import { QUESTS, QUEST_CATEGORIES } from "@/lib/questData";
import {
  fetchItemShop,
  getRarityColor,
  translateRarity,
  translateType,
  formatVBucks,
} from "@/lib/fortniteApi";
import QuestCard from "./QuestCard";
import ShopItemCard from "./ShopItemCard";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";

type Tab = "objectives" | "shop";

export default function FortniteApp() {
  const [activeTab, setActiveTab] = useState<Tab>("objectives");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<QuestCategory | "all" | "favorites">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopError, setShopError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [shopFilter, setShopFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fn-favorites");
      if (stored) setFavorites(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("fn-favorites", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const loadShop = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setShopLoading(true);
    setShopError(false);
    try {
      const items = await fetchItemShop();
      setShopItems(items);
      setLastUpdated(new Date());
    } catch {
      setShopError(true);
    } finally {
      setShopLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

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
        q.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, favorites]);

  const filteredShop = useMemo(() => {
    if (shopFilter === "all") return shopItems;
    return shopItems.filter((item) => item.type === shopFilter);
  }, [shopItems, shopFilter]);

  const questCounts = useMemo(() => {
    const counts: Record<string, number> = { all: QUESTS.length, favorites: favorites.size };
    for (const cat of Object.keys(QUEST_CATEGORIES)) {
      counts[cat] = QUESTS.filter((q) => q.category === cat).length;
    }
    return counts;
  }, [favorites.size]);

  const shopTypes = useMemo(() => {
    const types = new Set(shopItems.map((i) => i.type));
    return ["all", ...Array.from(types)];
  }, [shopItems]);

  const newQuestCount = QUESTS.filter((q) => q.isNew).length;

  return (
    <div className="min-h-screen bg-fortnite-dark" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-fortnite-border"
        style={{ background: "rgba(10,14,26,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg, #00d4ff, #8b5cf6)" }}>
                🎮
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight"
                  style={{ background: "linear-gradient(135deg, #00d4ff, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  فورتنایت
                </h1>
                <p className="text-xs text-gray-400 leading-tight">فصل ۲ – فصل ۷</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-900 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("objectives")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  activeTab === "objectives"
                    ? "bg-fortnite-card text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}>
                🎯 اهداف
                {newQuestCount > 0 && (
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{ background: "#ef4444", color: "#fff", fontSize: "10px" }}>
                    {newQuestCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("shop")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "shop"
                    ? "bg-fortnite-card text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}>
                🛒 آیتم‌شاپ
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadShop(true)}
              disabled={refreshing || shopLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0"
              style={{
                background: "linear-gradient(135deg, #00d4ff20, #8b5cf620)",
                border: "1px solid #00d4ff40",
                color: refreshing ? "#6b7280" : "#00d4ff",
              }}>
              <span className={refreshing ? "animate-spin" : ""}>🔄</span>
              <span className="hidden sm:inline">{refreshing ? "بروزرسانی..." : "بروزرسانی"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* OBJECTIVES TAB */}
        {activeTab === "objectives" && (
          <div className="space-y-5">
            {/* Search */}
            <SearchBar value={search} onChange={setSearch} />

            {/* Category Filter */}
            <CategoryFilter
              activeCategory={activeCategory}
              onChange={setActiveCategory}
              counts={questCounts}
              favoritesCount={favorites.size}
            />

            {/* Stats row */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                نمایش <span className="text-white font-bold">{filteredQuests.length}</span> از{" "}
                <span className="text-white">{QUESTS.length}</span> هدف
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>فصل ۲ فصل ۷</span>
                <span>·</span>
                <span style={{ color: "#ffd700" }}>XP کل: {filteredQuests.reduce((s, q) => s + q.xpReward, 0).toLocaleString("fa-IR")}</span>
              </div>
            </div>

            {/* Quest Grid */}
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
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SHOP TAB */}
        {activeTab === "shop" && (
          <div className="space-y-5">
            {/* Shop Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">آیتم‌شاپ امروز</h2>
                {lastUpdated && (
                  <p className="text-xs text-gray-400 mt-1">
                    آخرین بروزرسانی: {lastUpdated.toLocaleTimeString("fa-IR")}
                  </p>
                )}
              </div>
              {shopItems.length > 0 && (
                <span className="text-sm text-gray-400">
                  <span className="text-white font-bold">{filteredShop.length}</span> آیتم
                </span>
              )}
            </div>

            {/* Shop Type Filter */}
            {shopItems.length > 0 && (
              <div className="tabs-scroll flex gap-2 pb-1">
                {shopTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setShopFilter(type)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      shopFilter === type
                        ? "text-black font-bold"
                        : "text-gray-400 hover:text-white"
                    }`}
                    style={
                      shopFilter === type
                        ? { background: "linear-gradient(135deg, #00d4ff, #8b5cf6)" }
                        : { background: "#111827", border: "1px solid #1f2937" }
                    }>
                    {type === "all" ? "همه" : translateType(type)}
                  </button>
                ))}
              </div>
            )}

            {/* Shop Content */}
            {shopLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-xl shimmer" style={{ aspectRatio: "3/4" }} />
                ))}
              </div>
            ) : shopError ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-5xl mb-4">⚠️</span>
                <p className="text-lg font-medium">خطا در بارگذاری آیتم‌شاپ</p>
                <p className="text-sm mt-1 mb-4">لطفاً دوباره تلاش کنید</p>
                <button onClick={() => loadShop()} className="btn-fortnite">
                  تلاش مجدد
                </button>
              </div>
            ) : filteredShop.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-5xl mb-4">🛒</span>
                <p className="text-lg font-medium">آیتمی یافت نشد</p>
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

            {/* Data source note */}
            <div className="text-center text-xs text-gray-600 py-4 border-t border-gray-800">
              داده‌های آیتم‌شاپ از{" "}
              <a href="https://fortnite-api.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">
                fortnite-api.com
              </a>{" "}
              · اهداف از{" "}
              <a href="https://www.fut.gg/objectives" target="_blank" rel="noopener" className="text-blue-400 hover:underline">
                fut.gg
              </a>{" "}
              و{" "}
              <a href="https://fortnite.gg/shop" target="_blank" rel="noopener" className="text-blue-400 hover:underline">
                fortnite.gg
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
