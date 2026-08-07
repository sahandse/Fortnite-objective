"use client";

import StatsSection from "./StatsSection";

export default function StatsTab() {
  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="section-title">📊 آمار بازیکن</h2>
        <p className="section-sub">جستجوی آمار با نام کاربری Epic Games</p>
      </div>
      <StatsSection />
    </div>
  );
}