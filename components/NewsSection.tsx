"use client";

import { FortniteNews } from "@/lib/fortniteApi";

interface Props {
  news: FortniteNews[];
  loading: boolean;
}

export default function NewsSection({ news, loading }: Props) {
  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shimmer" style={{ borderRadius: 16, height: 260 }} />
        ))}
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
        <p style={{ color: "var(--c-muted)", fontSize: 15 }}>اخباری یافت نشد</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
      {news.map((item) => (
        <div
          key={item.id}
          className="card card-lift"
          style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
          {/* Image */}
          {item.image ? (
            <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background =
                      "linear-gradient(135deg, rgba(0,201,245,0.08), rgba(124,58,237,0.08))";
                    parent.innerHTML =
                      '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px">📢</div>';
                  }
                }}
              />
              {/* Gradient overlay at bottom of image */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                background: "linear-gradient(to top, rgba(15,22,36,1), transparent)",
              }} />
            </div>
          ) : (
            <div style={{
              aspectRatio: "16/9", flexShrink: 0,
              background: "linear-gradient(135deg, rgba(0,201,245,0.08), rgba(124,58,237,0.08))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 52, borderBottom: "1px solid var(--c-border)",
            }}>
              📢
            </div>
          )}

          {/* Text content */}
          <div style={{ padding: "14px 16px 16px", flex: 1 }}>
            <h3 style={{
              fontWeight: 700, fontSize: 15, color: "var(--c-text)",
              lineHeight: 1.4, marginBottom: 8,
            }}>
              {item.title}
            </h3>
            {item.body && (
              <p style={{
                fontSize: 13, color: "var(--c-muted)",
                lineHeight: 1.65,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {item.body}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
