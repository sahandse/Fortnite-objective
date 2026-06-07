"use client";

import { Quest } from "@/types";
import { QUEST_CATEGORIES } from "@/lib/questData";

interface Props {
  quest: Quest;
  isFavorite: boolean;
  isCompleted: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export default function QuestCard({ quest, isFavorite, isCompleted, onToggleFavorite, onToggleComplete }: Props) {
  const cat = QUEST_CATEGORIES[quest.category];

  return (
    <div
      className="relative rounded-xl p-4 card-hover group transition-opacity"
      style={{
        background: isCompleted ? "#0a1a0a" : "#111827",
        border: `1px solid ${isCompleted ? "#22c55e40" : "#1f2937"}`,
        borderRight: `3px solid ${isCompleted ? "#22c55e" : cat.color}`,
        opacity: isCompleted ? 0.7 : 1,
      }}>
      {/* New badge */}
      {quest.isNew && !isCompleted && (
        <span className="absolute top-3 left-12 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#ef4444", color: "#fff" }}>
          جدید
        </span>
      )}

      {/* Top-right actions */}
      <div className="absolute top-3 left-3 flex items-center gap-1">
        {/* Complete checkbox */}
        <button
          onClick={() => onToggleComplete(quest.id)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all"
          style={{
            background: isCompleted ? "#22c55e" : "#1f2937",
            border: `1px solid ${isCompleted ? "#22c55e" : "#374151"}`,
            color: isCompleted ? "#fff" : "#9ca3af",
          }}
          title={isCompleted ? "علامت‌گذاری به عنوان انجام نشده" : "علامت‌گذاری به عنوان انجام شده"}>
          {isCompleted ? "✓" : ""}
        </button>
        {/* Favorite */}
        <button
          onClick={() => onToggleFavorite(quest.id)}
          className={`star-btn text-base ${isFavorite ? "active" : "text-gray-600 opacity-0 group-hover:opacity-100"}`}
          aria-label="علاقه‌مندی">
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>

      {/* Category badge */}
      <div className="mb-3 pl-16">
        <span className={`text-xs font-medium px-2 py-1 rounded-lg category-${quest.category}`}>
          {cat.icon} {cat.labelFa}
          {quest.week && ` · هفته ${quest.week}`}
        </span>
      </div>

      {/* Title with strikethrough if completed */}
      <h3 className={`font-bold text-sm leading-relaxed mb-1 ${isCompleted ? "line-through text-gray-500" : "text-white"}`}>
        {quest.titleFa}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
        {quest.descriptionFa}
      </p>

      {/* Target */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        <span>🎯</span>
        <span>{quest.target.toLocaleString("fa-IR")} {quest.targetUnit}</span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-3">
        <div className="progress-fill" style={{ width: isCompleted ? "100%" : "0%" }} />
      </div>

      {/* XP Reward */}
      <div className="flex items-center justify-between">
        <span className={`xp-badge ${isCompleted ? "opacity-50" : ""}`}>
          {isCompleted ? "✅" : "✨"} {quest.xpReward.toLocaleString("fa-IR")} XP
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
