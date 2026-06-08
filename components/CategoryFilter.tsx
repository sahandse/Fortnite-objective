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
  { key: "all",       labelFa: "همه",         icon: "🌐", color: "#8896ae" },
  { key: "favorites", labelFa: "علاقه‌مندی", icon: "⭐", color: "#f0b429" },
  { key: "completed", labelFa: "انجام شده",  icon: "✅", color: "#10b981" },
  ...Object.entries(QUEST_CATEGORIES).map(([key, val]) => ({
    key: key as QuestCategory,
    labelFa: val.labelFa,
    icon: val.icon,
    color: val.color,
  })),
];

export default function CategoryFilter({ activeCategory, onChange, counts }: Props) {
  return (
    <div className="tabs-scroll" style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
      {ALL_CATEGORIES.map((cat) => {
        const count = counts[cat.key] ?? 0;
        const isActive = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 13px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              border: isActive ? `1px solid ${cat.color}35` : "1px solid rgba(255,255,255,0.06)",
              background: isActive ? `${cat.color}12` : "rgba(255,255,255,0.03)",
              color: isActive ? cat.color : "var(--c-muted)",
              fontFamily: "'Vazirmatn', sans-serif",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.labelFa}</span>
            {count > 0 && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 999,
                background: isActive ? `${cat.color}22` : "rgba(255,255,255,0.06)",
                color: isActive ? cat.color : "var(--c-dim)",
                minWidth: 20,
                textAlign: "center",
                lineHeight: "1.6",
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
