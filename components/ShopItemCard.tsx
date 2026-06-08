"use client";

import { useState } from "react";
import { ShopItem } from "@/types";
import {
  getRarityColor,
  translateRarity,
  translateType,
  formatVBucks,
  fortniteGgUrl,
} from "@/lib/fortniteApi";

interface Props {
  item: ShopItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const TYPE_EMOJI: Record<string, string> = {
  outfit: "👤", emote: "💃", pickaxe: "⛏️", glider: "🪂",
  wrap: "🎨", backpack: "🎒", contrail: "✨", spray: "🖌️",
  loading: "🖼️", banner: "🏳️", toy: "🎮", music: "🎵", bundle: "📦",
};

export default function ShopItemCard({ item, isFavorite, onToggleFavorite }: Props) {
  const [imgState, setImgState] = useState<"loading" | "ok" | "error">("loading");
  const [hovered, setHovered] = useState(false);
  const rColor = getRarityColor(item.rarity);
  const imageSrc = item.images.featured ?? item.images.icon ?? item.images.smallIcon;
  const emoji = TYPE_EMOJI[item.type] ?? "🎮";

  return (
    <div
      className="shop-card"
      style={{
        border: `1px solid ${rColor}30`,
        background: `linear-gradient(165deg, ${rColor}13 0%, #050810 100%)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rarity top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 2,
        background: `linear-gradient(90deg, ${rColor}cc, transparent)`,
        borderRadius: "14px 14px 0 0",
      }} />

      {/* Image / placeholder */}
      {imageSrc ? (
        <>
          {imgState !== "ok" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
              background: `linear-gradient(165deg, ${rColor}20, #050810)`,
            }}>
              <span style={{ fontSize: 40, lineHeight: 1 }}>{emoji}</span>
              {imgState === "loading" && (
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: `2px solid ${rColor}30`,
                  borderTopColor: rColor,
                  animation: "spin 0.75s linear infinite",
                }} />
              )}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={item.nameFa || item.name}
            crossOrigin="anonymous"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              opacity: imgState === "ok" ? 1 : 0,
              transition: "opacity 0.35s ease",
            }}
            onLoad={() => setImgState("ok")}
            onError={() => setImgState("error")}
          />
        </>
      ) : (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          background: `linear-gradient(165deg, ${rColor}18, #050810)`,
        }}>
          <span style={{ fontSize: 46, lineHeight: 1 }}>{emoji}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: rColor,
            textAlign: "center", padding: "0 10px", lineHeight: 1.4,
          }}>
            {item.nameFa || item.name}
          </span>
        </div>
      )}

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, transparent 35%, rgba(3,5,14,0.97) 100%)",
      }} />

      {/* Hover glow */}
      <div className="shop-card-glow" style={{
        boxShadow: `inset 0 0 35px ${rColor}22`,
        opacity: hovered ? 1 : 0,
      }} />

      {/* Favorite button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
        style={{
          position: "absolute", top: 8, right: 8, zIndex: 10,
          width: 28, height: 28, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
          background: "rgba(0,0,0,0.6)",
          border: "none", cursor: "pointer",
          opacity: isFavorite || hovered ? 1 : 0,
          color: isFavorite ? "#f0b429" : "rgba(255,255,255,0.5)",
          transition: "all 0.2s ease",
        }}>
        {isFavorite ? "⭐" : "☆"}
      </button>

      {/* Fortnite.gg link */}
      <a
        href={fortniteGgUrl(item.id)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", top: 8, left: item.isBundle ? 44 : 8, zIndex: 10,
          width: 28, height: 28, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12,
          background: "rgba(0,0,0,0.6)",
          border: "none", cursor: "pointer", textDecoration: "none",
          opacity: hovered ? 1 : 0,
          color: "rgba(255,255,255,0.7)",
          transition: "all 0.2s ease",
        }}
        title="مشاهده در Fortnite.gg"
      >
        🔗
      </a>

      {/* Bundle badge */}
      {item.isBundle && (
        <span style={{
          position: "absolute", top: 8, left: 8, zIndex: 10,
          fontSize: 10, fontWeight: 800,
          padding: "2px 7px", borderRadius: 6,
          background: "#f0b429", color: "#000",
        }}>
          بسته
        </span>
      )}

      {/* Bottom info */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
        padding: "8px 10px 10px",
      }}>
        <div style={{
          fontWeight: 700, color: "#fff", fontSize: 13,
          lineHeight: 1.35, marginBottom: 5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {item.nameFa || item.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: rColor, fontWeight: 600 }}>{translateRarity(item.rarity)}</span>
          <span style={{ fontSize: 11, color: "var(--c-dim)" }}>{translateType(item.type)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="text-vbucks" style={{ fontSize: 13, fontWeight: 900, lineHeight: 1 }}>V</span>
          <span style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>{formatVBucks(item.price)}</span>
        </div>
      </div>
    </div>
  );
}
