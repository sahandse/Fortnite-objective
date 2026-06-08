"use client";

import { useState, useEffect } from "react";
import { JamTrack, fetchJamTracks, daysAgo } from "@/lib/fortniteApi";

const GENRE_FA: Record<string, string> = {
  Rock: "راک", Pop: "پاپ", "Hip-Hop": "هیپ‌هاپ", Metal: "متال",
  Alternative: "آلترناتیو", Country: "کانتری", Electronic: "الکترونیک",
  Synthwave: "سینت‌ویو", "R&B": "آر‌اند‌بی", Soul: "سول",
  Jazz: "جاز", Blues: "بلوز", Punk: "پانک", Indie: "ایندی",
  Dance: "دنس", Classical: "کلاسیک", Reggae: "رگه",
};

const DIFF_COLORS = ["#6b7280","#22c55e","#3b82f6","#f0b429","#f97316","#ef4444","#c05dff","#ff1cf7"];

function DiffBar({ label, value }: { label: string; value?: number }) {
  if (value === undefined || value === null) return null;
  const pct = Math.round((value / 7) * 100);
  const color = DIFF_COLORS[Math.min(value, 7)];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 10, color: "#6b7280", width: 38, flexShrink: 0, textAlign: "right" }}>{label}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#1f2937", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color, width: 12, flexShrink: 0 }}>{value}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function JamTracksSection() {
  const [tracks, setTracks] = useState<JamTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchJamTracks().then((data) => {
      setTracks(data);
      setLoading(false);
    });
  }, []);

  const filtered = tracks.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.track.title.toLowerCase().includes(q) ||
      t.track.artist.toLowerCase().includes(q) ||
      (t.track.genres ?? []).some((g) => g.toLowerCase().includes(q))
    );
  });

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجوی آهنگ یا خواننده..."
        style={{
          width: "100%", padding: "10px 16px", borderRadius: 12,
          background: "#111827", border: "1px solid #1f2937",
          color: "#e5e7eb", fontSize: 14, outline: "none",
          boxSizing: "border-box",
        }}
      />

      {/* Count + link */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#9ca3af" }}>
          {loading ? "در حال بارگذاری..." : `${filtered.length} آهنگ`}
        </span>
        <a
          href="https://fortnite.gg/daily-jam-tracks"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12, color: "#00c9f5", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          🎵 جم‌ترک‌های روزانه در fortnite.gg ↗
        </a>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer" style={{ height: 76, borderRadius: 14 }} />
          ))}
        </div>
      )}

      {/* Track list */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 0",
          background: "#111827", border: "1px solid #1f2937",
          borderRadius: 16, color: "#6b7280",
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎵</div>
          <p className="text-sm">آهنگی یافت نشد</p>
        </div>
      )}

      {!loading && filtered.map((t) => {
        const tr = t.track;
        const art = t.images?.artwork ?? tr.albumArt;
        const isOpen = expanded === t.id;
        const age = daysAgo(t.added);

        return (
          <div
            key={t.id}
            onClick={() => setExpanded(isOpen ? null : t.id)}
            style={{
              background: "#0f172a",
              border: "1px solid #1f2937",
              borderRadius: 14,
              overflow: "hidden",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#374151")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1f2937")}
          >
            {/* Track row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
              {/* Album art */}
              <div style={{
                width: 52, height: 52, borderRadius: 10, flexShrink: 0, overflow: "hidden",
                background: "linear-gradient(135deg, #00c9f5 0%, #7c3aed 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {art ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={art} alt={tr.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 24 }}>🎵</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flexWrap: "wrap" }}>
                  <p style={{
                    fontWeight: 700, fontSize: 14, color: "#e5e7eb",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}>
                    {tr.title}
                  </p>
                  {age !== null && age <= 7 && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 5,
                      background: "#10b981", color: "#fff", flexShrink: 0,
                    }}>
                      {age === 0 ? "امروز" : `${age}روز`}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{tr.artist}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                  {tr.bpm > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                      background: "#1f2937", color: "#6b7280",
                    }}>
                      {tr.bpm} BPM
                    </span>
                  )}
                  {tr.duration > 0 && (
                    <span style={{ fontSize: 10, color: "#6b7280" }}>⏱ {formatDuration(tr.duration)}</span>
                  )}
                  {(tr.genres ?? []).slice(0, 2).map((g) => (
                    <span key={g} style={{
                      fontSize: 10, padding: "2px 6px", borderRadius: 6,
                      background: "#1e3a4c", color: "#00c9f5",
                    }}>
                      {GENRE_FA[g] ?? g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expand arrow */}
              <span style={{
                fontSize: 12, color: "#4b5563", flexShrink: 0,
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}>
                ▼
              </span>
            </div>

            {/* Expanded difficulty */}
            {isOpen && (
              <div style={{
                padding: "12px 14px 14px",
                borderTop: "1px solid #1f2937",
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>سختی بر اساس ابزار</p>
                <DiffBar label="گیتار" value={tr.difficulty?.guitar} />
                <DiffBar label="باس" value={tr.difficulty?.bass} />
                <DiffBar label="درامز" value={tr.difficulty?.drums} />
                <DiffBar label="ووکال" value={tr.difficulty?.vocals} />
                {tr.spotifyId && (
                  <a
                    href={`https://open.spotify.com/track/${tr.spotifyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      marginTop: 8, fontSize: 12, color: "#1db954",
                      textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    🎧 گوش دادن در Spotify
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <div style={{ textAlign: "center", fontSize: 12, color: "#4b5563", paddingTop: 4 }}>
          داده از{" "}
          <a href="https://fortnite-api.com" target="_blank" rel="noopener"
            style={{ color: "#00c9f5", textDecoration: "none" }}>
            fortnite-api.com
          </a>
          {" · "}
          <a href="https://fortnite.gg/daily-jam-tracks" target="_blank" rel="noopener"
            style={{ color: "#00c9f5", textDecoration: "none" }}>
            fortnite.gg
          </a>
        </div>
      )}
    </div>
  );
}
