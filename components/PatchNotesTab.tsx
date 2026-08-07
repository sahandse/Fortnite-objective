"use client";

import PatchNotesSection from "./PatchNotesSection";

export default function PatchNotesTab() {
  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="section-title">📋 پچ‌نوت فارسی</h2>
        <p className="section-sub">اخبار بتل رویال · ذخیره جهان · کریتیو + آیتم‌های جدید</p>
      </div>
      <PatchNotesSection />
    </div>
  );
}