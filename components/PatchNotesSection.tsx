"use client";

import { useState, useEffect } from "react";
import {
  fetchAllGameNews, GameNewsItem,
  fetchNewCosmetics, NewCosmeticsData,
  getRarityColor, translateType, daysAgo,
} from "@/lib/fortniteApi";
import { getItemNameFa } from "@/lib/persianNames";

const MODE_META = {
  br:       { label: "بتل رویال",    icon: "🎮", color: "#2563eb" },
  stw:      { label: "ذخیره جهان",   icon: "🏰", color: "#f0b429" },
  creative: { label: "کریتیو",       icon: "🎨", color: "#10b981" },
};

const OFFICIAL_LINKS = [
  { label: "پچ‌نوت رسمی Epic Games", url: "https://www.epicgames.com/fortnite/en-US/patch-notes", icon: "📋" },
  { label: "اخبار فورتنایت",          url: "https://www.epicgames.com/fortnite/en-US/news",        icon: "📢" },
  { label: "وضعیت سرور",             url: "https://status.epicgames.com",                          icon: "🟢" },
  { label: "سابریدیت فورتنایت",       url: "https://www.reddit.com/r/FortNiteBR",                  icon: "👾" },
];

export default function PatchNotesSection() {
  const [news, setNews]       = useState<GameNewsItem[]>([]);
  const [leaks, setLeaks]     = useState<NewCosmeticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setMode] = useState<"all" | "br" | "stw" | "creative">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchAllGameNews(),
      fetchNewCosmetics(),
    ]).then(([n, l]) => {
      setNews(n);
      setLeaks(l);
      setLoading(false);
    });
  }, []);

  const filtered = modeFilter === "all" ? news : news.filter((n) => n.mode === modeFilter);
  const newItems = (leaks?.items ?? []).slice(0, 12);

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Mode filter ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setMode("all")} style={chipStyle(modeFilter === "all", "#6b7280")}>
          📰 همه ({news.length})
        </button>
        {(["br", "stw", "creative"] as const).map((m) => {
          const cnt = news.filter((n) => n.mode === m).length;
          if (!cnt) return null;
          const { label, icon, color } = MODE_META[m];
          return (
            <button key={m} onClick={() => setMode(m)} style={chipStyle(modeFilter === m, color)}>
              {icon} {label} ({cnt})
            </button>
          );
        })}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ overflow: "hidden" }}>
              <div className="shimmer" style={{ aspectRatio: "16/9" }} />
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="shimmer" style={{ height: 14, borderRadius: 5, width: "70%" }} />
                <div className="shimmer" style={{ height: 11, borderRadius: 5, width: "90%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── News cards ── */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((item) => {
            const meta = MODE_META[item.mode];
            const isOpen = expanded === item.id;
            return (
              <div
                key={item.id}
                className="card"
                style={{ overflow: "hidden", border: `1px solid ${meta.color}20` }}
              >
                {/* Image */}
                {item.image && (
                  <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image} alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={(e) => { (e.currentTarget.parentElement!).style.display = "none"; }}
                    />
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                      background: "linear-gradient(to top, rgba(10,15,30,1), transparent)",
                    }} />
                    {/* Mode badge on image */}
                    <span style={{
                      position: "absolute", top: 8, right: 8,
                      fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                      background: meta.color, color: "#fff",
                    }}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                )}

                {/* Text */}
                <div
                  style={{ padding: "12px 14px", cursor: "pointer" }}
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    {!item.image && (
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                        background: meta.color, color: "#fff", flexShrink: 0, marginTop: 2,
                      }}>
                        {meta.icon} {meta.label}
                      </span>
                    )}
                    <h3 style={{
                      fontWeight: 700, fontSize: 14, color: "var(--c-text)",
                      lineHeight: 1.45, flex: 1, margin: 0,
                    }}>
                      {item.title}
                    </h3>
                    <span style={{
                      fontSize: 11, color: "#4b5563", flexShrink: 0, marginTop: 2,
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}>▼</span>
                  </div>

                  {/* Body: always shown if short, collapsible if long */}
                  {item.body && (
                    <p style={{
                      fontSize: 12, color: "var(--c-muted)", lineHeight: 1.7,
                      marginTop: 6, margin: "6px 0 0",
                      display: isOpen ? "block" : "-webkit-box",
                      WebkitLineClamp: isOpen ? undefined : 2,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: isOpen ? "visible" : "hidden",
                    }}>
                      {item.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
          <p>خبری برای این بخش یافت نشد</p>
        </div>
      )}

      {/* ── New cosmetics section ── */}
      {!loading && newItems.length > 0 && (
        <section>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span>🆕</span> آیتم‌های تازه‌اضافه‌شده
            <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", marginRight: "auto" }}>
              بیلد {leaks?.build}
            </span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8 }}>
            {newItems.map((item) => {
              const rarity = item.rarity?.value?.toLowerCase() ?? "common";
              const rColor = getRarityColor(rarity);
              const img = item.images?.icon ?? item.images?.smallIcon;
              const nameFa = getItemNameFa(item.name ?? "");
              const age = daysAgo(item.added);
              return (
                <div key={item.id} style={{
                  position: "relative", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden",
                  border: `1.5px solid ${rColor}40`,
                  background: `linear-gradient(160deg, ${rColor}15 0%, #050810 100%)`,
                }}>
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={nameFa} loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  {age !== null && age <= 7 && (
                    <span style={{
                      position: "absolute", top: 3, left: 3,
                      fontSize: 7, fontWeight: 800, padding: "1px 4px", borderRadius: 3,
                      background: "#10b981", color: "#fff",
                    }}>
                      {age === 0 ? "امروز" : `${age}ر`}
                    </span>
                  )}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "4px 4px 5px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.88), transparent)",
                  }}>
                    <p style={{ fontSize: 8, color: "#e5e7eb", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {nameFa || item.name}
                    </p>
                    <p style={{ fontSize: 7, color: "#6b7280", textAlign: "center" }}>
                      {translateType(item.type?.value?.toLowerCase() ?? "")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Official links ── */}
      <section>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span>🔗</span> منابع رسمی
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {OFFICIAL_LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank" rel="noopener noreferrer"
              className="card"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px", textDecoration: "none",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#374151")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
            >
              <span style={{ fontSize: 20 }}>{link.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#e5e7eb" }}>{link.label}</span>
              <span style={{ fontSize: 11, color: "#4b5563", marginRight: "auto" }}>↗</span>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}

function chipStyle(active: boolean, color: string): React.CSSProperties {
  return {
    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
    border: "none", cursor: "pointer", transition: "all 0.15s",
    background: active ? color : "#111827",
    color: active ? "#fff" : "#6b7280",
  };
}
