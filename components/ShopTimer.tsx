"use client";

import { useEffect, useState } from "react";

export default function ShopTimer() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function calc() {
      const now = new Date();
      const next = new Date(now);
      next.setUTCHours(24, 0, 0, 0);
      const diff = Math.max(0, next.getTime() - now.getTime());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl"
      style={{ background: "#111827", border: "1px solid #1f2937" }}>
      <span className="text-sm text-gray-400">ریست شاپ</span>
      <div className="flex items-center gap-1 font-mono font-bold text-sm">
        {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="px-2 py-1 rounded-lg text-white"
              style={{ background: "#1f2937", minWidth: "32px", textAlign: "center" }}>
              {pad(val)}
            </span>
            {i < 2 && <span style={{ color: "#00d4ff" }}>:</span>}
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-500">UTC</span>
    </div>
  );
}
