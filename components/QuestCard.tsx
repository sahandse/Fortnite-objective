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

const CAT_CLASS: Record<string, string> = {
  daily: "cat-daily", weekly: "cat-weekly", story: "cat-story",
  battlepass: "cat-battlepass", ranked: "cat-ranked",
  event: "cat-event", milestone: "cat-milestone",
};

export default function QuestCard({
  quest, isFavorite, isCompleted, onToggleFavorite, onToggleComplete,
}: Props) {
  const cat = QUEST_CATEGORIES[quest.category];

  return (
    <div
      className="card card-lift group"
      style={{
        position: "relative",
        padding: "16px",
        borderRight: `3px solid ${isCompleted ? "#10b981" : cat.color}`,
        borderColor: isCompleted ? "rgba(16,185,129,0.2)" : undefined,
        background: isCompleted ? "rgba(16,185,129,0.03)" : undefined,
        opacity: isCompleted ? 0.75 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Actions — top left */}
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 5, zIndex: 1 }}>
        <button
          onClick={() => onToggleComplete(quest.id)}
          title={isCompleted ? "علامت‌گذاری انجام‌نشده" : "علامت‌گذاری انجام‌شده"}
          style={{
            width: 26, height: 26, borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800,
            border: `1px solid ${isCompleted ? "#10b981" : "rgba(255,255,255,0.1)"}`,
            background: isCompleted ? "#10b981" : "rgba(255,255,255,0.04)",
            color: isCompleted ? "#000" : "var(--c-dim)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}>
          {isCompleted ? "✓" : ""}
        </button>
        <button
          onClick={() => onToggleFavorite(quest.id)}
          style={{
            width: 26, height: 26, borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, border: "none", background: "none",
            cursor: "pointer",
            opacity: isFavorite ? 1 : 0,
            color: isFavorite ? "#f0b429" : "var(--c-dim)",
            transition: "all 0.2s ease",
          }}
          className="group-hover:opacity-100">
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>

      {/* New badge */}
      {quest.isNew && !isCompleted && (
        <span style={{
          position: "absolute", top: 12, left: 72,
          fontSize: 10, fontWeight: 700,
          padding: "2px 8px", borderRadius: 999,
          background: "#ef4444", color: "#fff",
          letterSpacing: "0.02em",
        }}>
          جدید
        </span>
      )}

      {/* Category badge */}
      <div style={{ marginBottom: 10, paddingLeft: 66 }}>
        <span className={`badge ${CAT_CLASS[quest.category] ?? ""}`}>
          {cat.icon} {cat.labelFa}
          {quest.week ? ` · هفته ${quest.week}` : ""}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontWeight: 700,
        fontSize: 14,
        lineHeight: 1.55,
        marginBottom: 6,
        color: isCompleted ? "var(--c-muted)" : "var(--c-text)",
        textDecoration: isCompleted ? "line-through" : "none",
      }}>
        {quest.titleFa}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: 12,
        color: "var(--c-muted)",
        lineHeight: 1.65,
        marginBottom: 10,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {quest.descriptionFa}
      </p>

      {/* Target */}
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        fontSize: 12, color: "var(--c-dim)", marginBottom: 10,
      }}>
        <span>🎯</span>
        <span>{quest.target.toLocaleString("fa-IR")} {quest.targetUnit}</span>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 12 }}>
        <div className="progress-fill" style={{ width: isCompleted ? "100%" : "0%" }} />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span className="badge-xp" style={{ opacity: isCompleted ? 0.65 : 1 }}>
          {isCompleted ? "✅" : "✨"} {quest.xpReward.toLocaleString("fa-IR")} XP
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {quest.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{
              fontSize: 11, color: "var(--c-dim)",
              padding: "2px 7px", borderRadius: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
