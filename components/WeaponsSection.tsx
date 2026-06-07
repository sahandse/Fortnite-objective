"use client";

import { useState } from "react";
import { WEAPONS, WEAPON_CATEGORIES, WeaponCategory, getTierColor } from "@/lib/weaponsData";

const RARITY_COLORS: Record<string, string> = {
  common: "#b8c4c8",
  uncommon: "#69be28",
  rare: "#2d91ff",
  epic: "#c05dff",
  legendary: "#ff8000",
};

export default function WeaponsSection() {
  const [activeCategory, setActiveCategory] = useState<WeaponCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"tier" | "dps" | "damage">("tier");

  const TIER_ORDER = ["S", "A", "B", "C", "D"];

  const filtered = WEAPONS
    .filter((w) => activeCategory === "all" || w.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "tier") return TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
      if (sortBy === "dps") return b.dps - a.dps;
      return b.damage - a.damage;
    });

  return (
    <div className="space-y-5">
      {/* Category filter */}
      <div className="tabs-scroll flex gap-2 pb-1">
        <button
          onClick={() => setActiveCategory("all")}
          className="shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={activeCategory === "all"
            ? { background: "#00d4ff20", border: "1px solid #00d4ff60", color: "#00d4ff" }
            : { background: "#111827", border: "1px solid #1f2937", color: "#6b7280" }}>
          🌐 همه
        </button>
        {(Object.entries(WEAPON_CATEGORIES) as [WeaponCategory, typeof WEAPON_CATEGORIES[WeaponCategory]][]).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className="shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={activeCategory === key
              ? { background: `${cat.color}20`, border: `1px solid ${cat.color}60`, color: cat.color }
              : { background: "#111827", border: "1px solid #1f2937", color: "#6b7280" }}>
            {cat.icon} {cat.labelFa}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400 shrink-0">مرتب‌سازی:</span>
        {(["tier", "dps", "damage"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className="px-3 py-1 rounded-lg transition-all"
            style={sortBy === s
              ? { background: "#8b5cf620", border: "1px solid #8b5cf660", color: "#8b5cf6" }
              : { background: "#111827", border: "1px solid #1f2937", color: "#6b7280" }}>
            {s === "tier" ? "رتبه" : s === "dps" ? "DPS" : "آسیب"}
          </button>
        ))}
      </div>

      {/* Weapon table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1f2937" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#0f172a" }}>
              <th className="text-right py-3 px-4 font-medium text-gray-400 w-8">رتبه</th>
              <th className="text-right py-3 px-4 font-medium text-gray-400">سلاح</th>
              <th className="text-right py-3 px-4 font-medium text-gray-400 hidden sm:table-cell">دسته</th>
              <th className="text-right py-3 px-4 font-medium text-gray-400">DPS</th>
              <th className="text-right py-3 px-4 font-medium text-gray-400 hidden md:table-cell">آسیب</th>
              <th className="text-right py-3 px-4 font-medium text-gray-400 hidden lg:table-cell">مجله</th>
              <th className="text-right py-3 px-4 font-medium text-gray-400 hidden lg:table-cell">برد</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w, i) => {
              const cat = WEAPON_CATEGORIES[w.category];
              const rarityColor = RARITY_COLORS[w.rarity] ?? "#b8c4c8";
              return (
                <tr
                  key={w.id}
                  className="border-t transition-colors"
                  style={{
                    borderColor: "#1f2937",
                    background: i % 2 === 0 ? "#111827" : "#0f172a",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#111827" : "#0f172a")}>
                  {/* Tier */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-base" style={{ color: getTierColor(w.tier) }}>
                      {w.tier}
                    </span>
                  </td>
                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{w.emoji}</span>
                      <div>
                        <div className="font-medium text-white leading-tight">{w.nameFa}</div>
                        <div className="text-xs hidden sm:block" style={{ color: rarityColor }}>
                          {w.rarity === "common" ? "معمولی" :
                           w.rarity === "uncommon" ? "غیرمعمول" :
                           w.rarity === "rare" ? "کمیاب" :
                           w.rarity === "epic" ? "حماسی" : "افسانه‌ای"}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-xs" style={{ color: cat.color }}>{cat.icon} {cat.labelFa}</span>
                  </td>
                  {/* DPS */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex flex-col gap-0.5 w-16">
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1f2937" }}>
                          <div className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (w.dps / 350) * 100)}%`,
                              background: `linear-gradient(90deg, #00d4ff, #8b5cf6)`,
                            }} />
                        </div>
                      </div>
                      <span className="font-bold text-white">{w.dps}</span>
                    </div>
                  </td>
                  {/* Damage */}
                  <td className="py-3 px-4 hidden md:table-cell text-gray-300">{w.damage}</td>
                  {/* Magazine */}
                  <td className="py-3 px-4 hidden lg:table-cell text-gray-300">{w.magazineSize === 999 ? "∞" : w.magazineSize}</td>
                  {/* Range */}
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "#1f2937", color: "#9ca3af" }}>
                      {w.range}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-center text-gray-600">
        آمار بر اساس نسخه v33 · رتبه‌بندی مبتنی بر meta فصل ۲ فصل ۷
      </p>
    </div>
  );
}
