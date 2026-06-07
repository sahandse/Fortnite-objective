"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
        🔍
      </span>
      <input
        type="text"
        placeholder="جستجو در اهداف..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pr-12 pl-10 py-3 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all"
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          fontFamily: "'Vazirmatn', sans-serif",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#00d4ff60";
          e.currentTarget.style.boxShadow = "0 0 0 2px #00d4ff20";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#1f2937";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-lg">
          ✕
        </button>
      )}
    </div>
  );
}
