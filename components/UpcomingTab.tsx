"use client";

import UpcomingSection from "./UpcomingSection";

export default function UpcomingTab() {
  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="section-title">🔮 لیک‌ها</h2>
        <p className="section-sub">آیتم‌های تازه‌اضافه‌شده به فایل‌های بازی — ممکنه زود در شاپ بیان</p>
      </div>
      <UpcomingSection />
    </div>
  );
}