"use client";

import { useState, useEffect } from "react";

// ── types ──────────────────────────────────────────────────────────────────────
interface ModeStat {
  wins: number; kills: number; kd: number;
  matches: number; winRate: number;
  killsPerMatch: number; minutesPlayed: number;
}
interface PlayerData {
  name: string; level: number;
  overall: ModeStat;
  solo?: ModeStat; duo?: ModeStat; squad?: ModeStat;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMode(raw: any): ModeStat | undefined {
  if (!raw) return undefined;
  return {
    wins: raw.wins ?? 0, kills: raw.kills ?? 0, kd: raw.kd ?? 0,
    matches: raw.matches ?? 0, winRate: raw.winRate ?? 0,
    killsPerMatch: raw.killsPerMatch ?? 0, minutesPlayed: raw.minutesPlayed ?? 0,
  };
}

function fmt(n: number, dec = 0) {
  return n.toLocaleString("fa-IR", { maximumFractionDigits: dec });
}

const STAT_CARDS = [
  { key: "wins",          label: "برد",       icon: "🏆", color: "#f0b429" },
  { key: "kd",            label: "K/D",       icon: "⚔️", color: "#00c9f5", dec: 2 },
  { key: "kills",         label: "کیل",       icon: "💀", color: "#ef4444" },
  { key: "matches",       label: "بازی",      icon: "🎮", color: "#6b7280" },
  { key: "winRate",       label: "نرخ برد",   icon: "📈", color: "#10b981", dec: 1, suffix: "٪" },
  { key: "killsPerMatch", label: "کیل/بازی",  icon: "🎯", color: "#c05dff", dec: 1 },
] as const;

// ── component ──────────────────────────────────────────────────────────────────
export default function StatsSection() {
  const [username, setUsername]       = useState("");
  const [apiKey, setApiKey]           = useState("");
  const [showKey, setShowKey]         = useState(false);
  const [player, setPlayer]           = useState<PlayerData | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<"key" | "notfound" | "private" | "network" | null>(null);
  const [mode, setMode]               = useState<"overall" | "solo" | "duo" | "squad">("overall");
  const [recentSearches, setRecent]   = useState<string[]>([]);

  useEffect(() => {
    try {
      const u = localStorage.getItem("fn:stats_user");
      const k = localStorage.getItem("fn:stats_key");
      const r = localStorage.getItem("fn:stats_recent");
      if (u) setUsername(u);
      if (k) setApiKey(k);
      if (r) setRecent(JSON.parse(r));
    } catch {}
  }, []);

  const addRecent = (name: string) => {
    const next = [name, ...recentSearches.filter((r) => r !== name)].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem("fn:stats_recent", JSON.stringify(next)); } catch {}
  };

  const search = async (nameArg?: string) => {
    const name = (nameArg ?? username).trim();
    if (!name) return;
    setLoading(true); setError(null); setPlayer(null);
    try {
      localStorage.setItem("fn:stats_user", name);
      if (apiKey) localStorage.setItem("fn:stats_key", apiKey.trim());

      const url = `https://fortnite-api.com/v2/stats/br/v2?name=${encodeURIComponent(name)}&accountType=epic`;
      const headers: HeadersInit = apiKey.trim() ? { Authorization: apiKey.trim() } : {};

      let data: unknown = null;
      // Try direct fetch
      try {
        const r = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
        if (r.status === 401 || r.status === 403) { setError("key"); return; }
        if (r.status === 404) { setError("notfound"); return; }
        if (!r.ok) throw new Error(`${r.status}`);
        data = await r.json();
      } catch (e: unknown) {
        if ((e as { message?: string })?.message === "key" || (e as { message?: string })?.message === "notfound") throw e;
        // Try CORS proxy
        try {
          const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(9000) });
          if (r.status === 401 || r.status === 403) { setError("key"); return; }
          if (r.status === 404) { setError("notfound"); return; }
          data = await r.json();
        } catch {
          setError("network"); return;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = (data as any)?.data;
      if (!d) { setError("notfound"); return; }
      const all = d?.stats?.all;
      if (!all?.overall) { setError("private"); return; }

      addRecent(d.account?.name ?? name);
      setPlayer({
        name:    d.account?.name ?? name,
        level:   d.battlePass?.level ?? 0,
        overall: parseMode(all.overall)!,
        solo:    parseMode(all.solo),
        duo:     parseMode(all.duo),
        squad:   parseMode(all.squad),
      });
      setMode("overall");
    } finally {
      setLoading(false);
    }
  };

  const active: ModeStat | undefined =
    mode === "overall" ? player?.overall :
    mode === "solo"    ? player?.solo    :
    mode === "duo"     ? player?.duo     : player?.squad;

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Search card ── */}
      <div className="card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            type="text" value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="نام کاربری Epic Games..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10,
              background: "#0f172a", border: "1px solid #1f2937",
              color: "#e5e7eb", fontSize: 14, outline: "none",
            }}
          />
          <button
            onClick={() => search()} disabled={loading || !username.trim()}
            style={{
              padding: "10px 18px", borderRadius: 10, border: "none", flexShrink: 0,
              background: loading || !username.trim() ? "#1f2937" : "linear-gradient(135deg,#2563eb,#7c3aed)",
              color: loading || !username.trim() ? "#4b5563" : "#fff",
              fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "⏳" : "جستجو"}
          </button>
        </div>

        {/* Recent */}
        {recentSearches.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {recentSearches.map((r) => (
              <button key={r} onClick={() => { setUsername(r); search(r); }} style={{
                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: "#111827", border: "1px solid #1f2937", color: "#9ca3af", cursor: "pointer",
              }}>
                {r}
              </button>
            ))}
          </div>
        )}

        {/* API Key toggle */}
        <button onClick={() => setShowKey(v => !v)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, color: "#4b5563", display: "flex", alignItems: "center", gap: 4,
        }}>
          {showKey ? "▲" : "▼"} کلید API — برای دسترسی به آمار خصوصی
        </button>
        {showKey && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <input
              type="password" value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API key از dash.fortnite-api.com"
              style={{
                padding: "9px 14px", borderRadius: 10,
                background: "#0f172a", border: "1px solid #1f2937",
                color: "#e5e7eb", fontSize: 12, outline: "none",
              }}
            />
            <a href="https://dash.fortnite-api.com" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: "#00c9f5", textDecoration: "none" }}>
              🔑 دریافت کلید رایگان از dash.fortnite-api.com ↗
            </a>
          </div>
        )}
      </div>

      {/* ── Errors ── */}
      {error === "key" && (
        <div className="card" style={{ padding: "20px 16px", borderColor: "#f0b42940" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔑</div>
          <p style={{ fontWeight: 700, color: "#f0b429", marginBottom: 4 }}>نیاز به API Key</p>
          <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.7 }}>
            آمار این بازیکن نیاز به کلید API دارد. یک کلید رایگان از dash.fortnite-api.com بگیر و در فیلد بالا وارد کن.
          </p>
          <button onClick={() => setShowKey(true)} style={{
            marginTop: 10, padding: "8px 16px", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg,#f0b429,#ff8c00)", color: "#000",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            وارد کردن کلید API ↑
          </button>
        </div>
      )}

      {error === "notfound" && (
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          <p style={{ fontWeight: 700 }}>بازیکن یافت نشد</p>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>نام کاربری Epic را بررسی کن</p>
        </div>
      )}

      {error === "private" && (
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
          <p style={{ fontWeight: 700 }}>پروفایل خصوصی است</p>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>بازیکن آمار خود را مخفی کرده</p>
        </div>
      )}

      {error === "network" && (
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📡</div>
          <p style={{ fontWeight: 700 }}>خطای اتصال</p>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => search()} style={{
              padding: "7px 14px", borderRadius: 8, border: "none",
              background: "#1f2937", color: "#e5e7eb", fontSize: 12, cursor: "pointer",
            }}>
              🔄 تلاش مجدد
            </button>
            <a
              href={`https://fortnitetracker.com/profile/all/${encodeURIComponent(username)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-block", padding: "7px 14px", borderRadius: 8,
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none",
              }}
            >
              مشاهده در fortnitetracker.com ↗
            </a>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="shimmer" style={{ height: 84, borderRadius: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 80, borderRadius: 12 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Player ── */}
      {player && !loading && (
        <>
          {/* Profile header */}
          <div className="card" style={{
            padding: "16px",
            background: "linear-gradient(135deg,#0d1a2e,#1a0d2e)",
            border: "1px solid #2563eb40",
            display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}>🎮</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>{player.name}</div>
              {player.level > 0 && (
                <div style={{ fontSize: 12, color: "#f0b429", marginTop: 2, fontWeight: 600 }}>
                  🏆 سطح {fmt(player.level)}
                </div>
              )}
            </div>
            <a
              href={`https://fortnitetracker.com/profile/all/${encodeURIComponent(player.name)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: "#00c9f5", textDecoration: "none" }}
            >
              🔗 tracker ↗
            </a>
          </div>

          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["overall", "solo", "duo", "squad"] as const).map((m) => {
              const labels = { overall: "کلی", solo: "Solo", duo: "Duo", squad: "Squad" };
              const avail = m === "overall" || !!player[m];
              return (
                <button key={m} onClick={() => avail && setMode(m)} disabled={!avail} style={{
                  flex: 1, padding: "7px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
                  border: "none", cursor: avail ? "pointer" : "not-allowed",
                  background: mode === m ? "linear-gradient(135deg,#2563eb,#7c3aed)" : avail ? "#111827" : "#0d1220",
                  color: mode === m ? "#fff" : avail ? "#9ca3af" : "#2d3748",
                  transition: "all 0.15s",
                }}>
                  {labels[m]}
                </button>
              );
            })}
          </div>

          {/* Stats grid */}
          {active ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {STAT_CARDS.map((card) => {
                const { key, label, icon, color } = card;
                const dec = "dec" in card ? (card as { dec: number }).dec : 0;
                const suffix = "suffix" in card ? (card as { suffix: string }).suffix : undefined;
                const val = active[key as keyof ModeStat] as number;
                const display = (suffix ? `${fmt(val, dec)}${suffix}` : fmt(val, dec));
                return (
                  <div key={key} className="card" style={{
                    padding: "12px 8px", textAlign: "center",
                    border: `1px solid ${color}20`,
                    background: `linear-gradient(135deg,${color}08,#050810)`,
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 17, fontWeight: 900, color, lineHeight: 1 }}>{display}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 3 }}>{label}</div>
                  </div>
                );
              })}
              <div className="card" style={{ padding: "12px", textAlign: "center", gridColumn: "1 / -1" }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  🕐 زمان بازی: {" "}
                  <strong style={{ color: "#e5e7eb" }}>
                    {fmt(Math.floor(active.minutesPlayed / 60))} ساعت
                  </strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
              آماری برای این مود ثبت نشده
            </div>
          )}
        </>
      )}

      {/* ── Empty state ── */}
      {!player && !loading && !error && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📊</div>
          <p style={{ fontWeight: 700, fontSize: 15, color: "var(--c-text)", marginBottom: 6 }}>آمار بازیکن</p>
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.8 }}>
            نام کاربری Epic Games رو وارد کن<br />
            K/D · برد · کیل و زمان بازی رو ببین
          </p>
          <div style={{ marginTop: 16, fontSize: 12, color: "#4b5563" }}>
            آمار خصوصی؟{" "}
            <button onClick={() => setShowKey(true)} style={{
              background: "none", border: "none", color: "#00c9f5",
              cursor: "pointer", fontSize: 12, textDecoration: "underline",
            }}>
              کلید API بزن
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", fontSize: 11, color: "#374151", paddingTop: 4 }}>
        داده از{" "}
        <a href="https://fortnite-api.com" target="_blank" rel="noopener" style={{ color: "#00c9f5", textDecoration: "none" }}>
          fortnite-api.com
        </a>
      </div>
    </div>
  );
}
