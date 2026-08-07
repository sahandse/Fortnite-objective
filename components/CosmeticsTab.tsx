"use client";

import CosmeticsSection from "./CosmeticsSection";

export default function CosmeticsTab() {
  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="section-title">مجموعه اسکین‌ها</h2>
        <p className="section-sub">همه آیتم‌های فورتنایت · علامت‌گذاری موارد دارم</p>
      </div>
      <CosmeticsSection />
    </div>
  );
}