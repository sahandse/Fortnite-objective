"use client";

import WeaponsSection from "./WeaponsSection";

const TIER_COLOR: Record<string, string> = { S: "#f0b429", A: "#22c55e", B: "#3b82f6", C: "#f97316", D: "#6b7280" };
const TIER_BG:    Record<string, string> = { S: "#f0b42912", A: "#22c55e12", B: "#3b82f612", C: "#f9731612", D: "#6b728012" };
const TIER_LABEL: Record<string, string> = { S: "بی‌نظیر", A: "عالی", B: "خوب", C: "متوسط", D: "ضعیف" };

export default function WeaponsTab() {
  return (
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
  );
}