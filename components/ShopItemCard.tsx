"use client";

import { useState } from "react";
import { ShopItem } from "@/types";
import {
  getRarityColor,
  translateRarity,
  translateType,
  translateSection,
  formatVBucks,
} from "@/lib/fortniteApi";

interface Props {
  item: ShopItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const TYPE_EMOJI: Record<string, string> = {
  outfit:   "👤",
  emote:    "💃",
  pickaxe:  "⛏️",
  glider:   "🪂",
  wrap:     "🎨",
  backpack: "🎒",
  contrail: "✨",
  spray:    "🖌️",
  loading:  "🖼️",
  banner:   "🏳️",
  toy:      "🎮",
  music:    "🎵",
  bundle:   "📦",
};

export default function ShopItemCard({ item, isFavorite, onToggleFavorite }: Props) {
  const [imgState, setImgState] = useState<"loading" | "ok" | "error">("loading");
  const rarityColor = getRarityColor(item.rarity);
  const imageSrc = item.images.featured ?? item.images.icon ?? item.images.smallIcon;
  const emoji = TYPE_EMOJI[item.type] ?? "🎮";

  return (
    <div
      className="shop-card group"
      style={{
        border: `2px solid ${rarityColor}70`,
        background: `linear-gradient(160deg, ${rarityColor}18 0%, #0f172a 100%)`,
      }}>

      {/* ── Image / Placeholder ── */}
      {imageSrc ? (
        <>
          {/* Placeholder shown while image loads or on error */}
          {imgState !== "ok" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: `linear-gradient(160deg, ${rarityColor}25, #0f172a)` }}>
              <span className="text-5xl">{emoji}</span>
              {imgState === "loading" && (
                <div className="w-6 h-6 rounded-full border-2 animate-spin"
                  style={{ borderColor: `${rarityColor}40`, borderTopColor: rarityColor }} />
              )}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={item.nameFa || item.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: imgState === "ok" ? 1 : 0 }}
            onLoad={() => setImgState("ok")}
            onError={() => setImgState("error")}
            crossOrigin="anonymous"
          />
        </>
      ) : (
        /* No URL at all → permanent emoji placeholder */
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ background: `linear-gradient(160deg, ${rarityColor}22, #0f172a)` }}>
          <span className="text-6xl drop-shadow-lg">{emoji}</span>
          <span className="text-xs font-medium px-2 text-center leading-tight"
            style={{ color: rarityColor }}>
            {item.nameFa || item.name}
          </span>
        </div>
      )}

      {/* ── Dark gradient overlay ── */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 45%, rgba(5,10,25,0.97) 100%)" }} />

      {/* ── Rarity top bar ── */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${rarityColor}, transparent)` }} />

      {/* ── Favorite button ── */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
        className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
        style={{
          background: "rgba(0,0,0,0.7)",
          opacity: isFavorite ? 1 : 0,
          color: isFavorite ? "#ffd700" : "#9ca3af",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = isFavorite ? "1" : "0")}>
        {isFavorite ? "⭐" : "☆"}
      </button>

      {/* ── Bundle badge ── */}
      {item.isBundle && (
        <span className="absolute top-2 left-2 z-20 text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: "#ffd700", color: "#000" }}>
          بسته
        </span>
      )}

      {/* ── Bottom info ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-2 space-y-1">
        {/* Section label */}
        {item.section && (
          <div className="text-xs" style={{ color: `${rarityColor}cc` }}>
            {translateSection(item.section)}
          </div>
        )}

        {/* Name */}
        <div className="font-bold text-white leading-tight text-sm line-clamp-2">
          {item.nameFa || item.name}
        </div>

        {/* Type + Rarity */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs" style={{ color: rarityColor }}>
            {translateRarity(item.rarity)}
          </span>
          <span className="text-xs text-gray-400">
            {translateType(item.type)}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-black"
            style={{ background: "linear-gradient(90deg,#00d4ff,#6ee7f7)",
                     WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            V
          </span>
          <span className="font-bold text-white text-sm">
            {formatVBucks(item.price)}
          </span>
        </div>
      </div>

      {/* ── Hover glow ── */}
      <div className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ boxShadow: `inset 0 0 25px ${rarityColor}35` }} />
    </div>
  );
}
