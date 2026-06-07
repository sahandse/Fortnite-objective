"use client";

import { Quest } from "@/types";
import { QUEST_CATEGORIES } from "@/lib/questData";

interface Props {
  quest: Quest;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function QuestCard({ quest, isFavorite, onToggleFavorite }: Props) {
  const cat = QUEST_CATEGORIES[quest.category];

  return (
    <div
      className="relative rounded-xl p-4 card-hover group"
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRight: `3px solid ${cat.color}`,
      }}>
      {/* New badge */}
      {quest.isNew && (
        <span
          className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#ef4444", color: "#fff" }}>
          جدید
        </span>
      )}

      {/* Favorite button */}
      <button
        onClick={() => onToggleFavorite(quest.id)}
        className={`absolute top-3 ${quest.isNew ? "left-14" : "left-3"} star-btn text-lg ${isFavorite ? "active" : "text-gray-600 opacity-0 group-hover:opacity-100"}`}
        aria-label="علاقه‌مندی">
        {isFavorite ? "⭐" : "☆"}
      </button>

      {/* Category badge */}
      <div className="flex items-start justify-between mb-3 pl-6">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-lg category-${quest.category}`}>
          {cat.icon} {cat.labelFa}
          {quest.week && ` · هفته ${quest.week}`}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-white text-sm leading-relaxed mb-1">
        {quest.titleFa}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
        {quest.descriptionFa}
      </p>

      {/* Target */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        <span>🎯</span>
        <span>
          {quest.target.toLocaleString("fa-IR")} {quest.targetUnit}
        </span>
      </div>

      {/* Progress bar (decorative) */}
      <div className="progress-bar mb-3">
        <div className="progress-fill" style={{ width: "0%" }} />
      </div>

      {/* XP Reward */}
      <div className="flex items-center justify-between">
        <span className="xp-badge">
          ✨ {quest.xpReward.toLocaleString("fa-IR")} XP
        </span>
        <div className="flex gap-1">
          {quest.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs text-gray-600 px-1.5 py-0.5 rounded"
              style={{ background: "#1f2937" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
