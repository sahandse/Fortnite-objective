"use client";

import GuidesSection from "./GuidesSection";

export default function GuidesTab() {
  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="section-title">راهنمای بازی</h2>
        <p className="section-sub">V-Bucks · مودها · کدهای تمرین · نکات حرفه‌ای</p>
      </div>
      <GuidesSection />
    </div>
  );
}