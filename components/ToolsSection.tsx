"use client";

import { useState } from "react";

const VBUCKS_PACKAGES = [
  { vbucks: 1000, usd: 7.99, bonus: 0 },
  { vbucks: 2800, usd: 19.99, bonus: 300 },
  { vbucks: 5000, usd: 31.99, bonus: 1000 },
  { vbucks: 13500, usd: 79.99, bonus: 3500 },
];
const TOMAN_PER_USD = 65000; // approximate

const CREATIVE_CODES = [
  { code: "7526-3873-7999", name: "Aim Lab — تمرین هدف‌گیری",      type: "aim",   desc: "بهترین مپ تمرین دقت تیراندازی" },
  { code: "6562-8953-6647", name: "Box Fighting — نبرد در باکس",   type: "box",   desc: "تمرین نبرد در فضای بسته · ۱v۱" },
  { code: "2476-8526-0249", name: "Edit Course — دوره ویرایش",      type: "edit",  desc: "تمرین ویرایش سریع بیلد" },
  { code: "0535-9107-0571", name: "Build Fights — نبرد بیلد",       type: "build", desc: "تمرین بیلدینگ در نبرد واقعی" },
  { code: "9180-5458-9757", name: "Healing Course — دوره شفا",      type: "heal",  desc: "تمرین مدیریت آیتم و شفادهنده‌ها" },
  { code: "3958-6073-5765", name: "Zone Wars — جنگ منطقه",          type: "zone",  desc: "تمرین موقعیت‌گیری آخر بازی" },
  { code: "7620-0771-9529", name: "Piece Control — کنترل فضا",      type: "piece", desc: "تمرین کنترل قطعات در ۱v۱" },
  { code: "5958-5189-3484", name: "Dropper — سقوط آزاد",            type: "drop",  desc: "مپ سرگرمی و ریلکس" },
];

const TYPE_COLOR: Record<string, string> = {
  aim:   "#00d4ff",
  box:   "#8b5cf6",
  edit:  "#ffd700",
  build: "#22c55e",
  heal:  "#ec4899",
  zone:  "#f97316",
  piece: "#14b8a6",
  drop:  "#a78bfa",
};

function formatNum(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function ToolsSection() {
  const [vbInput, setVbInput] = useState("");
  const [calcMode, setCalcMode] = useState<"vb2usd" | "usd2vb">("vb2usd");
  const [copied, setCopied] = useState<string | null>(null);

  // Calculator logic
  const inputNum = parseFloat(vbInput) || 0;
  let vbucks = 0;
  let usd = 0;
  let toman = 0;

  if (calcMode === "vb2usd") {
    vbucks = inputNum;
    usd = (inputNum / 1000) * 7.99;
    toman = usd * TOMAN_PER_USD;
  } else {
    usd = inputNum;
    vbucks = Math.floor((inputNum / 7.99) * 1000);
    toman = inputNum * TOMAN_PER_USD;
  }
  const rial = toman * 10;

  // Copy code logic
  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  // Best value = highest vbucks per dollar
  const bestPkgIndex = VBUCKS_PACKAGES.reduce((bestIdx, pkg, i, arr) => {
    const ratio = (pkg.vbucks + pkg.bonus) / pkg.usd;
    const bestRatio = (arr[bestIdx].vbucks + arr[bestIdx].bonus) / arr[bestIdx].usd;
    return ratio > bestRatio ? i : bestIdx;
  }, 0);

  return (
    <div className="space-y-5" dir="rtl">

      {/* ── V-Bucks Calculator ───────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: "#111827", border: "1px solid #1f2937" }}
      >
        <h2 className="text-base font-bold" style={{ color: "#e5e7eb" }}>
          💰 ماشین‌حساب V-Bucks
        </h2>

        {/* Mode toggle */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: "1px solid #1f2937" }}
        >
          {(["vb2usd", "usd2vb"] as const).map((mode) => {
            const isActive = calcMode === mode;
            return (
              <button
                key={mode}
                onClick={() => { setCalcMode(mode); setVbInput(""); }}
                className="flex-1 py-2 text-sm font-medium transition-all"
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                        color: "#fff",
                      }
                    : {
                        background: "transparent",
                        color: "#6b7280",
                      }
                }
              >
                {mode === "vb2usd" ? "V-Bucks → قیمت" : "دلار → V-Bucks"}
              </button>
            );
          })}
        </div>

        {/* Input */}
        <input
          type="number"
          min="0"
          value={vbInput}
          onChange={(e) => setVbInput(e.target.value)}
          placeholder={
            calcMode === "vb2usd"
              ? "تعداد V-Bucks را وارد کنید..."
              : "مبلغ دلار را وارد کنید..."
          }
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            background: "#0f172a",
            border: "1px solid #1f2937",
            color: "#e5e7eb",
          }}
        />

        {/* Results 2×2 grid */}
        {inputNum > 0 && (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
          >
            {/* V-Bucks */}
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "#0f172a", border: "1px solid #2563eb40" }}
            >
              <p className="text-xs mb-1" style={{ color: "#6b7280" }}>V-Bucks</p>
              <p className="text-lg font-bold" style={{ color: "#2d91ff" }}>
                {formatNum(vbucks)}
              </p>
            </div>
            {/* USD */}
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "#0f172a", border: "1px solid #22c55e40" }}
            >
              <p className="text-xs mb-1" style={{ color: "#6b7280" }}>دلار</p>
              <p className="text-lg font-bold" style={{ color: "#22c55e" }}>
                ${formatNum(usd, 2)}
              </p>
            </div>
            {/* Toman */}
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "#0f172a", border: "1px solid #f9741640" }}
            >
              <p className="text-xs mb-1" style={{ color: "#6b7280" }}>تومان</p>
              <p className="text-lg font-bold" style={{ color: "#f97316" }}>
                {formatNum(Math.round(toman))}
              </p>
            </div>
            {/* Rial */}
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "#0f172a", border: "1px solid #a78bfa40" }}
            >
              <p className="text-xs mb-1" style={{ color: "#6b7280" }}>ریال</p>
              <p className="text-lg font-bold" style={{ color: "#a78bfa" }}>
                {formatNum(Math.round(rial))}
              </p>
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-xs text-center" style={{ color: "#4b5563" }}>
          نرخ تقریبی ۶۵,۰۰۰ تومان معادل ۱ دلار · مرجع رسمی نیست
        </p>
      </div>

      {/* ── V-Bucks Packages ─────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: "#111827", border: "1px solid #1f2937" }}
      >
        <h2 className="text-base font-bold" style={{ color: "#e5e7eb" }}>
          📦 مقایسه پکیج‌های V-Bucks
        </h2>

        <div className="space-y-3">
          {VBUCKS_PACKAGES.map((pkg, i) => {
            const totalVb = pkg.vbucks + pkg.bonus;
            const tomanPrice = pkg.usd * TOMAN_PER_USD;
            const perDollar = totalVb / pkg.usd;
            const isBest = i === bestPkgIndex;
            return (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{
                  background: isBest ? "#0f172a" : "#0d1117",
                  border: `1px solid ${isBest ? "#ffd70040" : "#1f2937"}`,
                }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  {/* Left: vbucks + badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold" style={{ color: "#2d91ff" }}>
                      {formatNum(totalVb)} V-Bucks
                    </span>
                    {pkg.bonus > 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "#22c55e20",
                          border: "1px solid #22c55e40",
                          color: "#22c55e",
                        }}
                      >
                        +{formatNum(pkg.bonus)} بونوس
                      </span>
                    )}
                    {isBest && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: "#ffd70025",
                          border: "1px solid #ffd70060",
                          color: "#ffd700",
                        }}
                      >
                        بهترین ارزش
                      </span>
                    )}
                  </div>

                  {/* Right: price */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: "#e5e7eb" }}>
                      ${formatNum(pkg.usd, 2)}
                    </p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      {formatNum(Math.round(tomanPrice))} تومان
                    </p>
                  </div>
                </div>

                {/* Per dollar ratio */}
                <p className="text-xs mt-2" style={{ color: "#2d91ff" }}>
                  {formatNum(Math.round(perDollar))} V-Bucks به ازای هر دلار
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Creative Codes ───────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: "#111827", border: "1px solid #1f2937" }}
      >
        <h2 className="text-base font-bold" style={{ color: "#e5e7eb" }}>
          🎯 کدهای Creative برای تمرین
        </h2>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
        >
          {CREATIVE_CODES.map((item) => {
            const color = TYPE_COLOR[item.type] ?? "#9ca3af";
            const isCopied = copied === item.code;
            return (
              <div
                key={item.code}
                className="rounded-xl p-3 flex flex-col gap-2"
                style={{
                  background: `${color}0d`,
                  border: `1px solid ${color}30`,
                }}
              >
                <div>
                  <p
                    className="text-xs font-bold leading-snug"
                    style={{ color: "#e5e7eb" }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-xs mt-0.5 leading-snug"
                    style={{ color: "#6b7280" }}
                  >
                    {item.desc}
                  </p>
                </div>
                <button
                  onClick={() => copyCode(item.code)}
                  className="w-full py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
                  style={{
                    background: isCopied ? `${color}30` : `${color}18`,
                    border: `1px solid ${color}50`,
                    color: color,
                    letterSpacing: isCopied ? "0.02em" : "0.05em",
                  }}
                >
                  {isCopied ? "✓ کپی شد!" : item.code}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
