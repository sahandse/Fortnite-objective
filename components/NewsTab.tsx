"use client";

import { useState, useEffect, useCallback } from "react";
import { FortniteNews } from "@/lib/fortniteApi";
import NewsSection from "./NewsSection";

export default function NewsTab() {
  const [news, setNews] = useState<FortniteNews[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const { fetchFortniteNews } = await import("@/lib/fortniteApi");
      const data = await fetchFortniteNews();
      setNews(data);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => { loadNews(); }, [loadNews]);

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">اخبار فورتنایت</h2>
          <p className="section-sub">آخرین رویدادها و به‌روزرسانی‌ها</p>
        </div>
        <button onClick={loadNews} disabled={newsLoading} className="btn btn-ghost">
          {newsLoading ? "..." : "🔄 بروزرسانی"}
        </button>
      </div>
      <NewsSection news={news} loading={newsLoading} />
      <div style={{ textAlign: "center", fontSize: 12, color: "var(--c-dim)", paddingTop: 8, borderTop: "1px solid var(--c-border)" }}>
        اخبار از{" "}
        <a href="https://fortnite-api.com" target="_blank" rel="noopener" style={{ color: "var(--c-blue)" }}>
          fortnite-api.com
        </a>
      </div>
    </div>
  );
}