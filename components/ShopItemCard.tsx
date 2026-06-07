"use client";

import { useState } from "react";
import { ShopItem } from "@/types";
import { getRarityColor, translateRarity, translateType, formatVBucks } from "@/lib/fortniteApi";

interface Props {
  item: ShopItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function ShopItemCard({ item, isFavorite, onToggleFavorite }: Props) {
  const [imgError, setImgError] = useState(false);
  const rarityColor = getRarityColor(item.rarity);
  const imageSrc = item.images.featured ?? item.images.icon ?? item.images.smallIcon;

  return (
    <div
      className="shop-card group"
      style={{
        border: `2px solid ${rarityColor}60`,
        background: `linear-gradient(135deg, ${rarityColor}10, #111827)`,
      }}>
      {/* Image */}
      {imageSrc && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-5xl"
          style={{ background: `linear-gradient(135deg, ${rarityColor}20, #111827)` }}>
          {item.type === "emote" ? "💃" :
           item.type === "pickaxe" ? "⛏️" :
           item.type === "glider" ? "🪂" :
           item.type === "wrap" ? "🎨" : "👤"}
        </div>
      )}

      {/* Overlay content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-2">
        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
          className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity star-btn ${isFavorite ? "active opacity-100" : ""}`}
          style={{ background: "rgba(0,0,0,0.7)" }}>
          {isFavorite ? "⭐" : "☆"}
        </button>

        {/* Bundle badge */}
        {item.isBundle && (
          <span className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ background: "#ffd700", color: "#000" }}>
            بسته
          </span>
        )}

        {/* Item info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-white font-bold text-xs leading-tight truncate">
              {item.nameFa || item.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium"
              style={{ color: rarityColor }}>
              {translateRarity(item.rarity)}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-white">
              <span style={{ color: "#00d4ff" }}>V</span>
              {formatVBucks(item.price)}
            </span>
          </div>
          <div className="text-xs" style={{ color: "#9ca3af" }}>
            {translateType(item.type)}
          </div>
        </div>
      </div>

      {/* Rarity glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: `inset 0 0 20px ${rarityColor}30` }}
      />
    </div>
  );
}
