"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
        fontSize: 16, opacity: 0.35, pointerEvents: "none", lineHeight: 1,
      }}>
        🔍
      </span>
      <input
        type="text"
        placeholder="جستجو در اهداف..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        style={{ paddingRight: 44, paddingLeft: value ? 40 : 16 }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none",
            color: "var(--c-dim)", cursor: "pointer",
            fontSize: 14, display: "flex", alignItems: "center",
            padding: 4, borderRadius: 6,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-dim)")}
        >
          ✕
        </button>
      )}
    </div>
  );
}
