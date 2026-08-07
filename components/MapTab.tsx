"use client";

import MapSection from "./MapSection";

export default function MapTab() {
  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="section-title">نقشه فورتنایت</h2>
        <p className="section-sub">مناطق نقشه · رتبه‌بندی لوت · جستجوی منطقه</p>
      </div>
      <MapSection />
    </div>
  );
}