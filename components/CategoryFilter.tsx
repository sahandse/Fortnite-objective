"use client";

import { QuestCategory } from "@/types";
import { QUEST_CATEGORIES } from "@/lib/questData";

type ActiveCat = QuestCategory | "all" | "favorites" | "completed";

interface Props {
  activeCategory: ActiveCat;
  onChange: (cat: ActiveCat) => void;
  counts: Record<string, number>;
  favoritesCount: number;
  completedCount: number;
}

const ALL_CATEGORIES: { key: ActiveCat; labelFa: string; icon: string; color: string }[] = [
  { key: "all",       labelFa: "همه",         icon: "🌐", color: "#6b7280" },
  { key: "favorites", labelFa: "علاقه‌مندی", icon: "⭐", color: "#ffd700" },
  { key: "completed", labelFa: "انجام شده",  icon: "✅", color: "#22c55e" },
  ...Object.entries(QUEST_CATEGORIES).map(([key, val]) => ({
    key: key as QuestCategory,
    labelFa: val.labelFa,
    icon: val.icon,
    color: val.color,
  })),
];

export default function CategoryFilter({ activeCategory, onChange, counts }: Props) {
  return (
    <div className="tabs-scroll flex gap-2 pb-1">
      {ALL_CATEGORIES.map((cat) => {
        const count = counts[cat.key] ?? 0;
        const isActive = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={isActive
              ? { background: `${cat.color}20`, border: `1px solid ${cat.color}60`, color: cat.color }
              : { background: "#111827", border: "1px solid #1f2937", color: "#6b7280" }}>
            <span>{cat.icon}</span>
            <span>{cat.labelFa}</span>
            {count > 0 && (
              <span className="text-xs rounded-full px-1.5 py-0.5 font-bold"
                style={{
                  background: isActive ? `${cat.color}30` : "#1f2937",
                  color: isActive ? cat.color : "#9ca3af",
                  minWidth: "20px",
                  textAlign: "center",
                }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
