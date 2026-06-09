"use client";

import { useState, useEffect } from "react";
import { fetchServerStatus, ServerStatusResult } from "@/lib/fortniteApi";

const COLOR: Record<string, string> = {
  operational: "#10b981",
  degraded:    "#f0b429",
  outage:      "#ef4444",
  unknown:     "#6b7280",
};

export default function ServerStatus() {
  const [status, setStatus] = useState<ServerStatusResult | null>(null);

  useEffect(() => {
    fetchServerStatus().then(setStatus);
    const id = setInterval(() => fetchServerStatus().then(setStatus), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const color = COLOR[status?.level ?? "unknown"];

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 5, cursor: "default" }}
      title="وضعیت سرورهای Epic Games"
    >
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: color,
        boxShadow: status?.level === "operational" ? `0 0 5px ${color}` : "none",
        flexShrink: 0,
        animation: !status ? "pulse 1.5s ease infinite" : "none",
      }} />
      <span style={{ fontSize: 11, color, fontWeight: 600, whiteSpace: "nowrap" }}>
        {status ? status.label : "…"}
      </span>
    </div>
  );
}
