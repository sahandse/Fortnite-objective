"use client";

import { useState, useEffect } from "react";

const SITES = [
  {
    name: "Fortnite Tracker",
    url: "https://fortnitetracker.com",
    desc: "آمار کامل · K/D · Win Rate · Match History · رنک‌بندی",
    icon: "📊",
    color: "#00d4ff",
  },
  {
    name: "Fortnite.GG",
    url: "https://fortnite.gg",
    desc: "آیتم‌شاپ زنده · تاریخچه آیتم‌ها · قیمت‌ها",
    icon: "🛒",
    color: "#8b5cf6",
  },
  {
    name: "Fortnite API",
    url: "https://fortnite-api.com",
    desc: "API رسمی · آمار · آیتم‌ها · نقشه · اخبار",
    icon: "🔌",
    color: "#22c55e",
  },
  {
    name: "Epic Games",
    url: "https://www.epicgames.com/fortnite/en-US/",
    desc: "سایت رسمی فورتنایت · دانلود · اخبار",
    icon: "🎮",
    color: "#ffd700",
  },
  {
    name: "Fortnite Wiki",
    url: "https://fortnite.fandom.com/wiki/Fortnite_Wiki",
    desc: "ویکی کامل فورتنایت · تاریخچه · آیتم‌ها",
    icon: "📖",
    color: "#f59e0b",
  },
  {
    name: "Fortnite Status",
    url: "https://status.epicgames.com",
    desc: "وضعیت سرورها · آپتایم · مشکلات فنی",
    icon: "🟢",
    color: "#6ee7b7",
  },
];

const STORAGE_KEY = "fn-recent-searches";
const MAX_RECENT = 5;

export default function StatsSection() {
  const [username, setUsername] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecent = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const updated = [
      trimmed,
      ...recentSearches.filter((r) => r !== trimmed),
    ].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSearch = (name: string = username) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    window.open(
      `https://fortnitetracker.com/profile/epic/${encodeURIComponent(trimmed)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section
      dir="rtl"
      style={{
        fontFamily: "'Vazirmatn', sans-serif",
        background: "#0a0e1a",
        minHeight: "100vh",
        padding: "2rem 1rem",
        color: "#e2e8f0",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#60a5fa",
            marginBottom: "0.25rem",
          }}
        >
          آمار بازیکنان
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          جستجوی آمار و دسترسی به منابع فورتنایت
        </p>
      </div>

      {/* Search Card */}
      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto 2rem",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "1rem",
          padding: "1.5rem",
        }}
      >
        <h3
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            marginBottom: "1rem",
            color: "#e2e8f0",
          }}
        >
          جستجوی بازیکن
        </h3>

        {/* Input + Button */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            dir="rtl"
            placeholder="نام کاربری Epic..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              borderRadius: "0.65rem",
              border: "1px solid #1e293b",
              background: "#0a0e1a",
              color: "#e2e8f0",
              fontSize: "1rem",
              outline: "none",
            }}
          />
          <button
            onClick={() => handleSearch()}
            disabled={!username.trim()}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.65rem",
              border: "none",
              background: username.trim() ? "#3b82f6" : "#1e293b",
              color: username.trim() ? "#fff" : "#475569",
              fontFamily: "'Vazirmatn', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: username.trim() ? "pointer" : "not-allowed",
              transition: "background 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            جستجو
          </button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#64748b",
                marginBottom: "0.4rem",
              }}
            >
              جستجوهای اخیر:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {recentSearches.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setUsername(name);
                    handleSearch(name);
                  }}
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    border: "1px solid #1e293b",
                    background: "#0a0e1a",
                    color: "#94a3b8",
                    fontFamily: "'Vazirmatn', sans-serif",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#3b82f6";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#60a5fa";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#1e293b";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#94a3b8";
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Useful Sites */}
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h3
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            marginBottom: "1rem",
            color: "#e2e8f0",
          }}
        >
          سایت‌های مفید
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {SITES.map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                background: "#0f172a",
                border: `1px solid ${site.color}33`,
                borderRadius: "0.85rem",
                padding: "1rem",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  site.color + "88";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "#1e293b";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  site.color + "33";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "#0f172a";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  flexShrink: 0,
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "0.5rem",
                  background: site.color + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                }}
              >
                {site.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: site.color,
                    margin: 0,
                  }}
                >
                  {site.name}
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#64748b",
                    margin: "0.2rem 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  {site.desc}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Info Box */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e40af55",
            borderRight: "3px solid #3b82f6",
            borderRadius: "0.75rem",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>💡</span>
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#60a5fa",
                margin: "0 0 0.25rem",
              }}
            >
              نکته
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              آمار مستقیم در نسخه‌های بعدی اضافه می‌شود. برای آمار دقیق از{" "}
              <a
                href="https://fortnitetracker.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#60a5fa", textDecoration: "underline" }}
              >
                fortnitetracker.com
              </a>{" "}
              استفاده کنید.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
