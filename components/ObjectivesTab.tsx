"use client";

import { useState, useMemo } from "react";
import { Quest, QuestCategory } from "@/types";
import { QUESTS, QUEST_CATEGORIES } from "@/lib/questData";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import QuestCard from "./QuestCard";
import Pagination from "./Pagination";

interface Props {
  quests: Quest[];
  search: string;
  onSearchChange: (v: string) => void;
  activeCategory: QuestCategory | "all" | "favorites" | "completed";
  onCategoryChange: (cat: QuestCategory | "all" | "favorites" | "completed") => void;
  favorites: Set<string>;
  completed: Set<string>;
  onToggleFavorite: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const PAGE_SIZE = 12;

export default function ObjectivesTab({
  quests,
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  favorites,
  completed,
  onToggleFavorite,
  onToggleComplete,
}: Props) {
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(filteredQuests.length / PAGE_SIZE);

  const pagedQuests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredQuests.slice(start, start + PAGE_SIZE);
  }, [filteredQuests, page]);

  const questCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: QUESTS.length, favorites: favorites.size, completed: completed.size,
    };
    for (const cat of Object.keys(QUEST_CATEGORIES)) {
      counts[cat] = QUESTS.filter((q) => q.category === cat).length;
    }
    return counts;
  }, [favorites.size, completed.size]);

  const totalXp = filteredQuests.reduce((s, q) => s + q.xpReward, 0);
  const earnedXp = filteredQuests.filter((q) => completed.has(q.id)).reduce((s, q) => s + q.xpReward, 0);

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SearchBar value={search} onChange={onSearchChange} />
      <CategoryFilter
        activeCategory={activeCategory}
        onChange={onCategoryChange}
        counts={questCounts}
        favoritesCount={favorites.size}
        completedCount={completed.size}
      />

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
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {pagedQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isFavorite={favorites.has(quest.id)}
                isCompleted={completed.has(quest.id)}
                onToggleFavorite={onToggleFavorite}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination current={page} total={totalPages} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}