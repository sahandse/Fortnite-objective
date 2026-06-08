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
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 13px",
      borderRadius: 10,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <span style={{ fontSize: 11, color: "var(--c-dim)", whiteSpace: "nowrap" }}>ریست شاپ</span>
      <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.09)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 2, fontFamily: "monospace" }}>
        {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)", letterSpacing: "-0.02em", minWidth: 22, textAlign: "center" }}>
              {pad(val)}
            </span>
            {i < 2 && <span style={{ color: "var(--c-blue)", fontSize: 13, fontWeight: 700 }}>:</span>}
          </span>
        ))}
      </div>
      <span style={{ fontSize: 10, color: "var(--c-dim)" }}>UTC</span>
    </div>
  );
}
