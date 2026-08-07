"use client";

import JamTracksSection from "./JamTracksSection";

export default function JamTracksTab() {
  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="section-title">جم‌ترک‌های فستیوال</h2>
        <p className="section-sub">آهنگ‌های موجود در Fortnite Festival · سختی ابزار</p>
      </div>
      <JamTracksSection />
    </div>
  );
}