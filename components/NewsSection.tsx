"use client";

import { FortniteNews } from "@/lib/fortniteApi";

interface Props {
  news: FortniteNews[];
  loading: boolean;
}

export default function NewsSection({ news, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl shimmer h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {news.map((item) => (
        <div
          key={item.id}
          className="rounded-xl p-4 card-hover"
          style={{ background: "#111827", border: "1px solid #1f2937" }}>
          <div className="flex gap-3">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center text-3xl"
                style={{ background: "linear-gradient(135deg, #00d4ff10, #8b5cf610)", border: "1px solid #1f2937" }}>
                📢
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm leading-snug mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{item.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
