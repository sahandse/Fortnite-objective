"use client";

interface Props {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pagination({ current, total, onChange }: Props) {
  if (total <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (total <= maxVisible + 2) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 4, marginTop: 16,
    }}>
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="btn btn-ghost"
        style={{ padding: "6px 10px", fontSize: 12 }}
      >
        ←
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} style={{
            padding: "6px 8px", fontSize: 12, color: "var(--c-dim)",
          }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`btn ${current === p ? "btn-primary" : "btn-ghost"}`}
            style={{
              padding: "6px 10px", fontSize: 12,
              minWidth: 32,
            }}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="btn btn-ghost"
        style={{ padding: "6px 10px", fontSize: 12 }}
      >
        →
      </button>
    </div>
  );
}