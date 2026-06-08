"use client";

import { useState, useEffect } from "react";
import { fetchPlaylists, Playlist } from "@/lib/fortniteApi";

// ── Battle Pass constants ─────────────────────────────────────────────────────
const BP_COST_VB = 950;
const BP_TOTAL_LEVELS = 100;
const BP_SKIP_COST = 150;       // V-Bucks per level
const BP_REWARD_VB = 1500;      // V-Bucks earned by completing BP
const XP_PER_LEVEL = 80000;
const XP_PER_DAILY = 14000;
const XP_PASSIVE_DAY = 20000;   // weekly quests + matches average

// ── V-Bucks packages ──────────────────────────────────────────────────────────
const VBUCKS_PACKAGES = [
  { vb: 1000,  usd: 7.99,  label: "۱٬۰۰۰" },
  { vb: 2800,  usd: 19.99, label: "۲٬۸۰۰" },
  { vb: 5000,  usd: 31.99, label: "۵٬۰۰۰" },
  { vb: 13500, usd: 79.99, label: "۱۳٬۵۰۰" },
];
const USD_TO_IRT = 85000; // approximate

// ── Battle Pass Calculator component ─────────────────────────────────────────
interface BPProps {
  current: number; setCurrent: (v: number) => void;
  target: number;  setTarget:  (v: number) => void;
  dailies: number; setDailies: (v: number) => void;
}

function BattlePassCalc({ current, setCurrent, target, setTarget, dailies, setDailies }: BPProps) {
  const levelsLeft = Math.max(0, target - current);
  const xpNeeded = levelsLeft * XP_PER_LEVEL;
  const xpPerDay = dailies * XP_PER_DAILY + XP_PASSIVE_DAY;
  const daysNeeded = xpPerDay > 0 ? Math.ceil(xpNeeded / xpPerDay) : 0;
  const skipCost = levelsLeft * BP_SKIP_COST;
  const pctDone = Math.round((current / BP_TOTAL_LEVELS) * 100);
  const isProfitable = current >= 40; // BP pays for itself around level 40

  return (
    <section>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <span>🏆</span> محاسبه‌گر Battle Pass
      </h3>

      {/* Progress bar visual */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#9ca3af" }}>
          <span>سطح {current}</span>
          <span style={{ color: "#f0b429", fontWeight: 700 }}>{pctDone}٪ کامل</span>
          <span>هدف {target}</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "#1f2937", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4,
            width: `${pctDone}%`,
            background: "linear-gradient(90deg, #f0b429, #ff8c00)",
            transition: "width 0.3s",
          }} />
        </div>
      </div>

      {/* Inputs row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>سطح فعلی</label>
          <input
            type="number" min={0} max={target - 1}
            value={current}
            onChange={(e) => setCurrent(Math.min(Math.max(0, +e.target.value), target - 1))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, background: "#111827", border: "1px solid #1f2937", color: "#e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>سطح هدف</label>
          <input
            type="number" min={current + 1} max={100}
            value={target}
            onChange={(e) => setTarget(Math.min(100, Math.max(current + 1, +e.target.value)))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, background: "#111827", border: "1px solid #1f2937", color: "#e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Daily quests selector */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 8 }}>
          کوئست روزانه انجام می‌دی؟
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3].map((n) => (
            <button key={n} onClick={() => setDailies(n)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
              border: "none", cursor: "pointer", transition: "all 0.15s",
              background: dailies === n ? "linear-gradient(135deg, #f0b429, #ff8c00)" : "#111827",
              color: dailies === n ? "#000" : "#6b7280",
            }}>
              {n === 1 ? "۱ کوئست" : n === 2 ? "۲ کوئست" : "۳ کوئست"}
            </button>
          ))}
        </div>
      </div>

      {/* Result cards */}
      {levelsLeft > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          <div className="card" style={{ padding: "14px", gridColumn: "1 / -1", background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>سطح‌های باقی‌مانده</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#f0b429" }}>{levelsLeft}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
              {(xpNeeded / 1_000_000).toFixed(1)}M XP مورد نیاز
            </div>
          </div>

          <div className="card" style={{ padding: "12px" }}>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4 }}>📅 زمان تخمینی</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#00c9f5" }}>{daysNeeded}</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>روز</div>
          </div>

          <div className="card" style={{ padding: "12px" }}>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4 }}>💎 هزینه Skip</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#c05dff" }}>{skipCost.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>V-Bucks</div>
          </div>

          <div className="card" style={{ padding: "12px", gridColumn: "1 / -1", borderColor: isProfitable ? "#10b98133" : "#374151" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{isProfitable ? "✅" : "⏳"}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isProfitable ? "#10b981" : "#9ca3af" }}>
                  {isProfitable
                    ? `BP ارزشش رو داد! ${BP_REWARD_VB.toLocaleString()} VB برگشتی`
                    : `با رسیدن به سطح ~۴۰، ${BP_REWARD_VB.toLocaleString()} VB برمی‌گرده`
                  }
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                  BP: 950 VB هزینه · {BP_REWARD_VB} VB درآمد
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
          <div style={{ fontWeight: 700, color: "#10b981" }}>Battle Pass کامل شد!</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{BP_REWARD_VB.toLocaleString()} VB جایزه گرفتی</div>
        </div>
      )}
    </section>
  );
}

// ── Creative practice codes ───────────────────────────────────────────────────
const CREATIVE_CODES = [
  { code: "2748-6583-3087", name: "Jigsaw Aim Training",     nameFa: "تمرین ایم Jigsaw",    cat: "ایم", icon: "🎯" },
  { code: "7269-0707-0290", name: "Mongraal Classic",        nameFa: "Mongraal Classic",     cat: "ایم", icon: "🎯" },
  { code: "0535-2461-6378", name: "Raider464 Edit Course",   nameFa: "دوره ویرایش",          cat: "ویرایش", icon: "✏️" },
  { code: "3966-9811-4759", name: "1v1 Build Fights",        nameFa: "دوئل ساختن",          cat: "ساختن", icon: "🏗️" },
  { code: "8422-6252-4474", name: "Box Fight (Thomas TV)",   nameFa: "باکس‌فایت",            cat: "باکس", icon: "📦" },
  { code: "6531-3220-2458", name: "Clix Box Fight",          nameFa: "باکس‌فایت Clix",      cat: "باکس", icon: "📦" },
  { code: "3587-5812-3012", name: "Desert Zone Wars",        nameFa: "زون‌وارز صحرا",        cat: "زون", icon: "🏜️" },
  { code: "3141-9865-4649", name: "Olympus Zone Wars",       nameFa: "زون‌وارز Olympus",    cat: "زون", icon: "🏔️" },
  { code: "6850-8440-3230", name: "The Storm Zone Wars",     nameFa: "زون‌وارز طوفان",      cat: "زون", icon: "⛈️" },
  { code: "7490-8112-8240", name: "100 Level Default Deathrun", nameFa: "ددران ۱۰۰ مرحله", cat: "ددران", icon: "💀" },
];

// ── Pro tips ──────────────────────────────────────────────────────────────────
const TIPS = [
  { icon: "⚙️", title: "FPS بالا", body: "گرافیک رو روی Performance Mode بذار. در بازی‌های زیاد تفاوت زیادی می‌کنه." },
  { icon: "🎯", title: "حساسیت موس", body: "برای شروع DPI=800 و Sens=7 توصیه میشه. بعد از تمرین تنظیم کن." },
  { icon: "⌨️", title: "کی‌بایندینگ", body: "Build: Q=Wall, F=Floor, E=Ramp, C=Cone. Edit: F یا G. Reset Edit رو فعال کن." },
  { icon: "🏗️", title: "بیلدینگ پایه", body: "در تنش‌زا، فوری یه Ramp+Wall بساز. ۹۰ درجه رو تمرین کن تا ارتفاع بگیری." },
  { icon: "🔄", title: "ریست ادیت", body: "از تنظیمات Confirm Edit on Release رو فعال کن. ادیت سریع‌تر میشه." },
  { icon: "🎧", title: "صدا", body: "Headset بزن. صدای قدم‌ها و ساختن دشمن مهمه. Volume Effects رو بالا بذار." },
  { icon: "💊", title: "شیلد اول", body: "بعد از فرود اول Slurp یا Shield Potion بخور، بعد تفنگ بپیچ." },
  { icon: "🗺️", title: "روتیشن", body: "زود به داخل Storm Circle برو. حاشیه storm نباش مگر که rotate داری." },
  { icon: "📊", title: "مکانیک رنک", body: "در Ranked، Placement بیشتر از Kill امتیاز میده. اول بقا، بعد فایت." },
  { icon: "🎮", title: "تمرین روزانه", body: "روزی ۱۵ دقیقه Creative در کد ایم‌ترینینگ بزن. بعد از ۲ هفته تفاوت مشخصه." },
];

// ── Playlist category map ─────────────────────────────────────────────────────
const MODE_FA: Record<string, string> = {
  "Battle Royale": "بتل رویال",
  "Zero Build": "بدون ساختن",
  "Ranked": "رنک‌دار",
  "Creative": "کریتیو",
  "Festival": "فستیوال",
  "LEGO": "لگو",
  "Rocket Racing": "مسابقه راکت",
  "Reload": "ریلود",
  "OG": "OG",
  "Solo": "Solo",
  "Duo": "Duo",
  "Squads": "Squads",
  "Trios": "Trios",
  "No Build": "بدون ساختن",
  "Core": "اصلی",
};
function faPart(s?: string): string {
  if (!s) return "";
  return MODE_FA[s] ?? s;
}

export default function GuidesSection() {
  // Battle Pass calc
  const [bpCurrent, setBpCurrent] = useState(0);
  const [bpTarget, setBpTarget] = useState(100);
  const [bpDailies, setBpDailies] = useState(2);

  // V-Bucks calc
  const [vbInput, setVbInput] = useState("1000");
  const [priceInput, setPriceInput] = useState("");
  const [activeDir, setActiveDir] = useState<"vb" | "price">("vb");
  const [copied, setCopied] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [codeFilter, setCodeFilter] = useState("همه");

  useEffect(() => {
    fetchPlaylists().then((data) => {
      setPlaylists(data);
      setPlaylistsLoading(false);
    });
  }, []);

  // V-Bucks calc
  const vb = parseInt(vbInput.replace(/,/g, "")) || 0;
  const price = parseFloat(priceInput) || 0;
  const bestPkg = VBUCKS_PACKAGES.reduce((best, pkg) =>
    pkg.vb / pkg.usd > best.vb / best.usd ? pkg : best
  );
  const calcUSD = activeDir === "vb" ? (vb / bestPkg.vb) * bestPkg.usd : 0;
  const calcVB  = activeDir === "price" ? Math.floor((price / bestPkg.usd) * bestPkg.vb) : 0;
  const calcIRT = activeDir === "vb" ? calcUSD * USD_TO_IRT : price * USD_TO_IRT;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const codeCategories = ["همه", ...Array.from(new Set(CREATIVE_CODES.map((c) => c.cat)))];
  const filteredCodes = codeFilter === "همه" ? CREATIVE_CODES : CREATIVE_CODES.filter((c) => c.cat === codeFilter);

  // Featured playlists only (well-known modes)
  const featuredIds = ["Solo", "Duo", "Squads", "No Build", "Ranked", "Zero Build", "Battle Royale", "Reload", "OG", "Festival"];
  const displayPlaylists = playlists
    .filter((p) => featuredIds.some((k) => (p.name + (p.subName ?? "")).includes(k)))
    .slice(0, 12);

  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Battle Pass Calculator ── */}
      <BattlePassCalc
        current={bpCurrent} setCurrent={setBpCurrent}
        target={bpTarget}   setTarget={setBpTarget}
        dailies={bpDailies} setDailies={setBpDailies}
      />

      {/* ── V-Bucks Calculator ── */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span>💎</span> ماشین‌حساب V-Bucks
        </h3>

        {/* Direction toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {(["vb", "price"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setActiveDir(d)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                background: activeDir === d
                  ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                  : "#111827",
                color: activeDir === d ? "#fff" : "#6b7280",
              }}
            >
              {d === "vb" ? "V-Bucks → قیمت" : "قیمت → V-Bucks"}
            </button>
          ))}
        </div>

        {activeDir === "vb" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                value={vbInput}
                onChange={(e) => setVbInput(e.target.value)}
                placeholder="تعداد V-Bucks"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "#111827", border: "1px solid #1f2937", color: "#e5e7eb", fontSize: 14, outline: "none" }}
              />
              <span style={{ fontSize: 20 }}>💎</span>
            </div>
            {vb > 0 && (
              <div className="card" style={{ padding: "12px 16px" }}>
                <div style={{ fontSize: 13, color: "var(--c-muted)", marginBottom: 6 }}>تخمین قیمت</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#00c9f5" }}>${calcUSD.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>≈ {Math.round(calcIRT).toLocaleString("fa-IR")} تومان</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="قیمت به دلار"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "#111827", border: "1px solid #1f2937", color: "#e5e7eb", fontSize: 14, outline: "none" }}
              />
              <span style={{ fontSize: 16, color: "#6b7280" }}>$</span>
            </div>
            {price > 0 && (
              <div className="card" style={{ padding: "12px 16px" }}>
                <div style={{ fontSize: 13, color: "var(--c-muted)", marginBottom: 6 }}>V-Bucks دریافتی</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#00c9f5" }}>{calcVB.toLocaleString()} 💎</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>≈ {Math.round(calcIRT).toLocaleString("fa-IR")} تومان</div>
              </div>
            )}
          </div>
        )}

        {/* Package comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginTop: 12 }}>
          {VBUCKS_PACKAGES.map((pkg) => {
            const rate = pkg.vb / pkg.usd;
            const isBest = pkg === bestPkg;
            return (
              <div key={pkg.vb} className="card" style={{
                padding: "10px 12px",
                border: isBest ? "1px solid #00c9f580" : "1px solid var(--c-border)",
                position: "relative",
              }}>
                {isBest && (
                  <span style={{
                    position: "absolute", top: -8, right: 8,
                    fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 5,
                    background: "#00c9f5", color: "#000",
                  }}>بهترین</span>
                )}
                <div style={{ fontWeight: 700, color: "#00c9f5", fontSize: 14 }}>💎 {pkg.label}</div>
                <div style={{ fontSize: 13, color: "#e5e7eb", marginTop: 2 }}>${pkg.usd}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{rate.toFixed(0)} VB/$</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Game Modes ── */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🎮</span> مودهای بازی
          {playlistsLoading && <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 400 }}>در حال بارگذاری...</span>}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {(playlistsLoading ? Array.from({ length: 6 }) : displayPlaylists).map((p, i) => {
            if (!p) return <div key={i} className="shimmer" style={{ height: 72, borderRadius: 12 }} />;
            const pl = p as Playlist;
            const isRanked = pl.name?.toLowerCase().includes("rank") || pl.gameType === "Ranked";
            const isZeroBuild = pl.name?.toLowerCase().includes("zero") || pl.subName?.toLowerCase().includes("no build");
            const icon = isRanked ? "🏆" : isZeroBuild ? "🚫🏗️" : "🎮";
            return (
              <div key={pl.id} className="card" style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text)", lineHeight: 1.4 }}>
                  {faPart(pl.subName) || faPart(pl.gameType) || pl.name?.split(" ").slice(-1)[0] || pl.name}
                </div>
                {pl.maxTeamSize && pl.maxTeamSize > 0 && (
                  <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                    👤 {pl.maxTeamSize === 1 ? "Solo" : pl.maxTeamSize === 2 ? "Duo" : pl.maxTeamSize === 3 ? "Trio" : `${pl.maxTeamSize} نفر`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#4b5563", marginTop: 8 }}>
          داده از{" "}
          <a href="https://fortnite-api.com" target="_blank" rel="noopener" style={{ color: "#00c9f5", textDecoration: "none" }}>
            fortnite-api.com
          </a>
        </div>
      </section>

      {/* ── Creative Codes ── */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🕹️</span> کدهای تمرین Creative
        </h3>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", scrollbarWidth: "none" }}>
          {codeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCodeFilter(cat)}
              style={{
                flexShrink: 0, padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                background: codeFilter === cat ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "#111827",
                color: codeFilter === cat ? "#fff" : "#6b7280",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredCodes.map((c) => (
            <div key={c.code} className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>{c.nameFa}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{c.name}</div>
              </div>
              <button
                onClick={() => copyCode(c.code)}
                style={{
                  flexShrink: 0, padding: "6px 12px", borderRadius: 8,
                  border: "1px solid #1f2937", cursor: "pointer",
                  background: copied === c.code ? "#10b981" : "#111827",
                  color: copied === c.code ? "#fff" : "#e5e7eb",
                  fontSize: 11, fontWeight: 700, transition: "all 0.2s",
                  fontFamily: "monospace",
                }}
              >
                {copied === c.code ? "✓ کپی شد" : c.code}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pro Tips ── */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span>💡</span> نکات حرفه‌ای
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
          {TIPS.map((t, i) => (
            <div key={i} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--c-text)" }}>{t.title}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--c-muted)", lineHeight: 1.7, margin: 0 }}>{t.body}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
