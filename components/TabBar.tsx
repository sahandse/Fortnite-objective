"use client";

type Tab = "objectives" | "shop" | "weapons" | "news" | "map" | "cosmetics" | "jamtracks" | "guides" | "upcoming" | "stats" | "patchnotes";

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  newQuestCount: number;
}

const TAB_DEFS: { key: Tab; label: string; icon: string }[] = [
  { key: "objectives", label: "اهداف",    icon: "🎯" },
  { key: "shop",       label: "شاپ",      icon: "🛒" },
  { key: "upcoming",   label: "لیک‌ها",   icon: "🔮" },
  { key: "stats",      label: "آمار",     icon: "📊" },
  { key: "patchnotes", label: "پچ‌نوت",   icon: "📋" },
  { key: "weapons",    label: "سلاح‌ها",  icon: "⚔️" },
  { key: "news",       label: "اخبار",    icon: "📢" },
  { key: "map",        label: "نقشه",     icon: "🗺️" },
  { key: "cosmetics",  label: "اسکین‌ها", icon: "🎨" },
  { key: "jamtracks",  label: "موزیک",    icon: "🎵" },
  { key: "guides",     label: "راهنما",   icon: "💡" },
];

export default function TabBar({ activeTab, onTabChange, newQuestCount }: Props) {
  return (
    <div className="tab-bar hidden md:flex" style={{ flex: 1 }}>
      {TAB_DEFS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.key === "objectives" && newQuestCount > 0 && (
            <span className="tab-badge">{newQuestCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}