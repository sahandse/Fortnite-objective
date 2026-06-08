"use client";

import { useState, useEffect, useMemo } from "react";
import { Cosmetic } from "@/types";
import {
  fetchCosmetics,
  fetchNewCosmetics,
  getRarityColor,
  translateRarity,
  translateType,
  fortniteGgUrl,
  daysAgo,
} from "@/lib/fortniteApi";
import { getItemNameFa } from "@/lib/persianNames";

const TYPES = ["outfit", "emote", "pickaxe", "glider", "backpack", "wrap", "spray", "contrail"];
const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
const PAGE_SIZE = 24;

export default function CosmeticsSection() {
  const [allItems, setAllItems] = useState<Cosmetic[]>([]);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("outfit");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showNewOnly, setShowNewOnly] = useState(false);

  // Load owned from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fn-owned");
      if (saved) setOwned(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Fetch new cosmetics ids once on mount
  useEffect(() => {
    fetchNewCosmetics().then((data) => {
      if (data?.items) {
        setNewItemIds(new Set(data.items.map((i) => i.id)));
      }
    });
  }, []);

  // Fetch when typeFilter changes; also reset search/rarity/page
  useEffect(() => {
    setLoading(true);
    setSearch("");
    setRarityFilter("all");
    setShowNewOnly(false);
    fetchCosmetics(typeFilter).then((items) => {
      setAllItems(items);
      setLoading(false);
      setPage(1);
    });
  }, [typeFilter]);

  const toggleOwned = (id: string) => {
    setOwned((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem("fn-owned", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const matchesRarity =
        rarityFilter === "all" || item.rarity?.value?.toLowerCase() === rarityFilter;
      const nameFa = getItemNameFa(item.name);
      const matchesSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        nameFa.toLowerCase().includes(search.toLowerCase());
      const matchesNew = !showNewOnly || newItemIds.has(item.id);
      return matchesRarity && matchesSearch && matchesNew;
    });
  }, [allItems, rarityFilter, search, showNewOnly, newItemIds]);

  const paged = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = paged.length < filtered.length;
  const remaining = filtered.length - paged.length;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Type filter tabs */}
      <div
        className="tabs-scroll flex gap-2 pb-1"
        style={{ overflowX: "auto", scrollbarWidth: "none" }}
      >
        {TYPES.map((t) => {
          const isActive = typeFilter === t;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                      border: "1px solid #7c3aed80",
                      color: "#fff",
                    }
                  : {
                      background: "#111827",
                      border: "1px solid #1f2937",
                      color: "#6b7280",
                    }
              }
            >
              {translateType(t)}
            </button>
          );
        })}
      </div>

      {/* Search + rarity + new filter row */}
      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="جستجوی آیتم..."
          className="flex-1 rounded-xl px-4 py-2 text-sm outline-none"
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            color: "#e5e7eb",
            minWidth: 120,
          }}
        />
        <select
          value={rarityFilter}
          onChange={(e) => { setRarityFilter(e.target.value); setPage(1); }}
          className="rounded-xl px-3 py-2 text-sm outline-none shrink-0"
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            color: "#e5e7eb",
          }}
        >
          <option value="all">همه ندرت‌ها</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>
              {translateRarity(r)}
            </option>
          ))}
        </select>
        <button
          onClick={() => { setShowNewOnly((v) => !v); setPage(1); }}
          className="shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-all"
          style={
            showNewOnly
              ? {
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "1px solid #10b98180",
                  color: "#fff",
                }
              : {
                  background: "#111827",
                  border: "1px solid #1f2937",
                  color: "#6b7280",
                }
          }
        >
          🆕 جدید
        </button>
      </div>

      {/* Stats line */}
      <div className="text-sm flex gap-2 items-center flex-wrap" style={{ color: "#9ca3af" }}>
        <span>{filtered.length} آیتم</span>
        <span>·</span>
        <span style={{ color: "#22c55e", fontWeight: 600 }}>{owned.size} دارم</span>
        {newItemIds.size > 0 && (
          <>
            <span>·</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>🆕 {newItemIds.size} تازه اضافه شده</span>
          </>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="shimmer rounded-xl"
              style={{ aspectRatio: "1/1" }}
            />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && paged.length > 0 && (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
        >
          {paged.map((item) => {
            const rarity = item.rarity?.value?.toLowerCase() ?? "common";
            const rColor = getRarityColor(rarity);
            const isOwned = owned.has(item.id);
            const imgSrc = item.images?.icon ?? item.images?.smallIcon;
            const nameFa = getItemNameFa(item.name);
            const isHovered = hoveredId === item.id;
            const isNew = newItemIds.has(item.id);
            const age = daysAgo(item.added);

            return (
              <div
                key={item.id}
                onClick={() => toggleOwned(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative rounded-xl overflow-hidden transition-transform"
                style={{
                  aspectRatio: "1/1",
                  border: `2px solid ${isOwned ? rColor : rColor + "40"}`,
                  background: `linear-gradient(160deg, ${rColor}15 0%, #0f172a 100%)`,
                  cursor: "pointer",
                  transform: isHovered ? "scale(1.03)" : "scale(1)",
                  boxShadow: isOwned
                    ? `0 0 16px ${rColor}50`
                    : isHovered
                    ? `0 0 10px ${rColor}30`
                    : "none",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
              >
                {/* Item image */}
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={nameFa || item.name}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                )}

                {/* New badge */}
                {isNew && !isHovered && !isOwned && (
                  <span
                    className="absolute"
                    style={{
                      top: 5, left: 5,
                      fontSize: 9, fontWeight: 800,
                      padding: "2px 5px", borderRadius: 5,
                      background: "#10b981",
                      color: "#fff",
                      zIndex: 5,
                    }}
                  >
                    {age !== null && age <= 7 ? `${age}روز` : "🆕"}
                  </span>
                )}

                {/* Owned overlay (only when not hovered) */}
                {isOwned && !isHovered && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "#00000060" }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>✅</span>
                  </div>
                )}

                {/* Hover overlay */}
                {isHovered && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity"
                    style={{ background: "#00000085" }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: rColor }}
                    >
                      {isOwned ? "دارم ✓" : "+ دارم"}
                    </span>
                    <a
                      href={fortniteGgUrl(item.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.6)",
                        textDecoration: "none",
                        marginTop: 2,
                      }}
                    >
                      🔗 fortnite.gg
                    </a>
                  </div>
                )}

                {/* Bottom name overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-1 pt-4 pb-1 text-center"
                  style={{
                    background:
                      "linear-gradient(to top, #000000cc 0%, transparent 100%)",
                    pointerEvents: "none",
                  }}
                >
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: "#e5e7eb" }}
                    title={nameFa || item.name}
                  >
                    {nameFa || item.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && paged.length === 0 && (
        <div
          className="rounded-xl py-16 text-center"
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            color: "#6b7280",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔍</div>
          <p className="text-sm">آیتمی یافت نشد</p>
          <p className="text-xs mt-1" style={{ color: "#4b5563" }}>
            فیلتر یا جستجو را تغییر دهید
          </p>
        </div>
      )}

      {/* Load more */}
      {!loading && hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            color: "#9ca3af",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "#4b5563")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "#1f2937")
          }
        >
          نمایش بیشتر · {remaining} آیتم دیگر
        </button>
      )}
    </div>
  );
}
