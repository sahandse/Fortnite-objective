"use client";

import { useState, useEffect, useMemo } from "react";
import { Cosmetic } from "@/types";
import { fetchNewCosmetics, NewCosmeticsData, getRarityColor, translateType, translateRarity, fortniteGgUrl, daysAgo } from "@/lib/fortniteApi";
import { getItemNameFa } from "@/lib/persianNames";

const TYPE_ICONS: Record<string, string> = {
  outfit: "👤", emote: "💃", pickaxe: "⛏️", glider: "🪂",
  wrap: "🎨", backpack: "🎒", contrail: "✨", spray: "🖌️",
  loading: "🖼️", banner: "🏳️", toy: "🎮", music: "🎵",
  bundle: "📦", shoes: "👟", guitar: "🎸", bass: "🎸", drum: "🥁",
  microphone: "🎤",
};

export default function UpcomingSection() {
  const [data, setData] = useState<NewCosmeticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    fetchNewCosmetics().then((d) => { setData(d); setLoading(false); });
  }, []);

  const types = useMemo(() => {
    if (!data?.items) return [];
    const s = new Set(data.items.map((i) => i.type?.value?.toLowerCase() ?? "unknown"));
    return ["all", ...Array.from(s).filter(Boolean).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((item) => {
      const t = item.type?.value?.toLowerCase() ?? "";
      const name = item.name ?? "";
      const nameFa = getItemNameFa(name);
      const matchType = typeFilter === "all" || t === typeFilter;
      const matchSearch = !search.trim() ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        nameFa.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [data, typeFilter, search]);

  if (loading) {
    return (
      <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 14, background: "#090e1f", overflow: "hidden" }}>
              <div className="shimmer" style={{ position: "absolute", inset: 0 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.items?.length) {
    return (
      <div dir="rtl" className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔮</div>
        <p style={{ color: "var(--c-muted)" }}>اطلاعاتی یافت نشد</p>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header info */}
      <div className="card" style={{
        padding: "12px 16px",
        background: "linear-gradient(135deg, #1a0533, #0d1a2e)",
        border: "1px solid #7c3aed40",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#c05dff" }}>
            🔮 آیتم‌های تازه اضافه‌شده به فایل‌های بازی
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
            بیلد {data.build || "نامشخص"} · {data.items.length} آیتم
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
          background: "#7c3aed", color: "#fff",
        }}>
          DATAMINED
        </span>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجو..."
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 12, boxSizing: "border-box",
          background: "#111827", border: "1px solid #1f2937",
          color: "#e5e7eb", fontSize: 14, outline: "none",
        }}
      />

      {/* Type filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            flexShrink: 0, padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            border: "none", cursor: "pointer", transition: "all 0.15s",
            background: typeFilter === t ? "linear-gradient(135deg, #7c3aed, #c05dff)" : "#111827",
            color: typeFilter === t ? "#fff" : "#6b7280",
          }}>
            {t === "all" ? `همه (${data.items.length})` : `${TYPE_ICONS[t] ?? "🎮"} ${translateType(t)}`}
          </button>
        ))}
      </div>

      {/* Count line */}
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        {filtered.length} آیتم نمایش داده می‌شه
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: "40px 24px", textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          <p className="text-sm">آیتمی یافت نشد</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
          {filtered.map((item: Cosmetic) => {
            const rarity = item.rarity?.value?.toLowerCase() ?? "common";
            const rColor = getRarityColor(rarity);
            const imgSrc = item.images?.icon ?? item.images?.smallIcon;
            const nameFa = getItemNameFa(item.name ?? "");
            const isHov = hovered === item.id;
            const age = daysAgo(item.added);
            const typeKey = item.type?.value?.toLowerCase() ?? "";

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative", aspectRatio: "1/1", borderRadius: 14, overflow: "hidden",
                  border: `2px solid ${rColor}50`,
                  background: `linear-gradient(160deg, ${rColor}18 0%, #050810 100%)`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  transform: isHov ? "scale(1.04)" : "scale(1)",
                  boxShadow: isHov ? `0 0 18px ${rColor}40` : "none",
                  cursor: "default",
                }}
              >
                {/* Top accent */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 2,
                  background: `linear-gradient(90deg, ${rColor}cc, transparent)`,
                }} />

                {/* Image or placeholder */}
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc} alt={nameFa || item.name}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 40,
                  }}>
                    {TYPE_ICONS[typeKey] ?? "🎮"}
                  </div>
                )}

                {/* Leak badge */}
                <span style={{
                  position: "absolute", top: 6, right: 6, zIndex: 5,
                  fontSize: 8, fontWeight: 900, padding: "2px 5px", borderRadius: 4,
                  background: "#7c3aed", color: "#fff",
                }}>
                  LEAK
                </span>

                {/* Age badge */}
                {age !== null && age <= 14 && (
                  <span style={{
                    position: "absolute", top: 6, left: 6, zIndex: 5,
                    fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 4,
                    background: "#10b981", color: "#fff",
                  }}>
                    {age === 0 ? "امروز" : `${age}ر`}
                  </span>
                )}

                {/* Hover overlay */}
                {isHov && (
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 8,
                    background: "rgba(0,0,0,0.82)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "8px",
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: rColor, textAlign: "center", lineHeight: 1.3 }}>
                      {nameFa || item.name}
                    </span>
                    <span style={{ fontSize: 9, color: "#9ca3af" }}>{translateRarity(rarity)}</span>
                    <a
                      href={fortniteGgUrl(item.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 10, color: "#00c9f5", textDecoration: "none",
                        marginTop: 2, display: "flex", alignItems: "center", gap: 3,
                      }}
                    >
                      🔗 fortnite.gg
                    </a>
                  </div>
                )}

                {/* Bottom name */}
                {!isHov && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3,
                    padding: "6px 6px 7px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                  }}>
                    <p style={{
                      fontSize: 9, fontWeight: 600, color: "#e5e7eb",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      textAlign: "center",
                    }}>
                      {nameFa || item.name}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ textAlign: "center", fontSize: 11, color: "#4b5563", paddingTop: 4 }}>
        داده از{" "}
        <a href="https://fortnite-api.com" target="_blank" rel="noopener" style={{ color: "#00c9f5", textDecoration: "none" }}>
          fortnite-api.com
        </a>
        {" · "}این آیتم‌ها ممکنه هرگز در شاپ نیان
      </div>
    </div>
  );
}
