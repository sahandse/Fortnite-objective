"use client";

import { useEffect, useState } from "react";

const POI_FA: Record<string, string> = {
  "Mount Olympus": "کوه المپ",
  "Grand Glacier": "یخچال بزرگ",
  "Classy Courts": "زمین‌های باکلاس",
  "Snooty Steppes": "استپ متکبر",
  "Pleasant Piazza": "میدانگاه دلپذیر",
  "Lavish Lair": "پناهگاه مجلل",
  "Brawler's Battleground": "میدان نبرد",
  "Rebel's Roost": "لانه یاغیان",
  "Restored Reels": "قرقره‌های بازیافته",
  "Fencing Fields": "مزارع حصاردار",
  "Rumble Ruins": "ویرانه‌های نبرد",
  "The Underworld": "جهان زیرین",
  "Grim Gate": "دروازه شوم",
  "Hazy Hillside": "تپه مه‌آلود",
  "Reckless Railways": "راه‌آهن بی‌پروا",
  "Ruined Reels": "قرقره‌های ویران",
  "Tilted Towers": "برج‌های کج",
  "Pleasant Park": "پارک دلپذیر",
  "Salty Springs": "چشمه‌های شور",
  "Dusty Depot": "انبار گردآلود",
  "Loot Lake": "دریاچه غنیمت",
  "Greasy Grove": "بیشه چرب",
  "Retail Row": "ردیف خرده‌فروشی",
  "Lucky Landing": "فرود خوش‌شانس",
  "Paradise Palms": "نخل‌های بهشتی",
  "Lazy Lagoon": "خور تنبل",
  "Neo Tilted": "نئو-کج",
  "Mega Mall": "مگامال",
  "Wailing Woods": "جنگل ناله‌کنان",
  "Haunted Hills": "تپه‌های مسکون",
  "Flush Factory": "کارخانه فلاش",
  "Fatal Fields": "مزارع مرگبار",
  "Snobby Shores": "سواحل متکبر",
  "Junk Junction": "چهارراه آشغال",
  "Anarchy Acres": "مزرعه آنارشی",
  "Moisty Mire": "باتلاق مرطوب",
  "Lonely Lodge": "کلبه تنها",
  "Dusty Divot": "گودال گردآلود",
};

type Tier = "S" | "A" | "B" | "C";

const LOOT_TIERS: Record<string, { tier: Tier; note: string }> = {
  "Mount Olympus": { tier: "S", note: "بهترین لوت + بوس" },
  "Lavish Lair": { tier: "S", note: "بوس اسکار + لوت عالی" },
  "Tilted Towers": { tier: "S", note: "لوت زیاد · خطر بالا" },
  "Mega Mall": { tier: "A", note: "ساختمان‌های پر از لوت" },
  "Lazy Lagoon": { tier: "A", note: "کشتی با لوت خوب" },
  "Retail Row": { tier: "A", note: "لوت متوسط رو به بالا" },
  "Loot Lake": { tier: "A", note: "چست‌های خوب" },
  "Grand Glacier": { tier: "A", note: "لوت خوب + کم خطر" },
  "Pleasant Park": { tier: "B", note: "خانه‌های متعدد" },
  "Salty Springs": { tier: "B", note: "مرکزیت عالی" },
  "Fencing Fields": { tier: "B", note: "مزرعه با لوت متوسط" },
  "Classy Courts": { tier: "B", note: "زمین تنیس" },
  "Brawler's Battleground": { tier: "C", note: "لوت کم" },
};

const TIER_COLORS: Record<Tier, string> = {
  S: "#ffd700",
  A: "#22c55e",
  B: "#3b82f6",
  C: "#9ca3af",
};

interface POI {
  id: string;
  name: string;
  location: { x: number; y: number; z: number };
}

interface MapData {
  images: {
    pois: string;
    blank: string;
  };
  pois: POI[];
}

export default function MapSection() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://fortnite-api.com/v1/map?language=en", {
      signal: AbortSignal.timeout(8000),
    })
      .then((r) => r.json())
      .then((d) => {
        setMapData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allPois: POI[] = mapData?.pois ?? [];

  const filteredPois = allPois.filter((poi) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const fa = (POI_FA[poi.name] ?? "").toLowerCase();
    return poi.name.toLowerCase().includes(q) || fa.includes(q);
  });

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
          نقشه فورتنایت
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          مکان‌های مهم نقشه و رتبه‌بندی لوت
        </p>
      </div>

      {/* Search */}
      <div style={{ maxWidth: "480px", margin: "0 auto 1.5rem" }}>
        <input
          type="text"
          dir="rtl"
          placeholder="جستجوی مکان..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid #1e293b",
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Map Image */}
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto 2rem",
          borderRadius: "1rem",
          overflow: "hidden",
          border: "1px solid #1e293b",
          background: "#0f172a",
          minHeight: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          /* Shimmer */
          <div
            style={{
              width: "100%",
              height: "400px",
              background:
                "linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        ) : imgError || !mapData?.images?.pois ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🗺️</div>
            <p style={{ color: "#64748b" }}>نقشه بارگذاری نشد</p>
          </div>
        ) : (
          <img
            src={mapData.images.pois}
            alt="Fortnite Map"
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        )}
      </div>

      {/* POI Grid */}
      {!loading && (
        <>
          {filteredPois.length === 0 ? (
            <p style={{ textAlign: "center", color: "#64748b", marginTop: "2rem" }}>
              مکانی با این نام پیدا نشد 🔍
            </p>
          ) : (
            <div
              style={{
                maxWidth: "960px",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {filteredPois.map((poi) => {
                const faName = POI_FA[poi.name];
                const loot = LOOT_TIERS[poi.name];
                return (
                  <div
                    key={poi.id}
                    style={{
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "0.75rem",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                  >
                    {/* Text side */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#e2e8f0",
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {faName ?? poi.name}
                      </p>
                      {faName && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#64748b",
                            margin: "0.1rem 0 0",
                            direction: "ltr",
                            textAlign: "right",
                          }}
                        >
                          {poi.name}
                        </p>
                      )}
                      {loot && (
                        <p
                          style={{
                            fontSize: "0.72rem",
                            color: "#94a3b8",
                            margin: "0.2rem 0 0",
                          }}
                        >
                          {loot.note}
                        </p>
                      )}
                    </div>

                    {/* Tier badge */}
                    {loot && (
                      <div
                        style={{
                          flexShrink: 0,
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "0.4rem",
                          background: TIER_COLORS[loot.tier] + "22",
                          border: `1px solid ${TIER_COLORS[loot.tier]}55`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          color: TIER_COLORS[loot.tier],
                        }}
                      >
                        {loot.tier}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Shimmer keyframe via style tag */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
}
