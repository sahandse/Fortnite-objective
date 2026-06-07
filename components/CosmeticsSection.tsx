"use client";

import { useState, useEffect, useMemo } from "react";
import { Cosmetic } from "@/types";
import { fetchCosmetics, getRarityColor, translateRarity, translateType } from "@/lib/fortniteApi";
import { getItemNameFa } from "@/lib/persianNames";

const TYPES = ["outfit", "emote", "pickaxe", "glider", "backpack", "wrap", "spray", "contrail"];
const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
const PAGE_SIZE = 24;

export default function CosmeticsSection() {
  const [allItems, setAllItems] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("outfit");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Load owned from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fn-owned");
      if (saved) setOwned(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Fetch when typeFilter changes
  useEffect(() => {
    setLoading(true);
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
      return matchesRarity && matchesSearch;
    });
  }, [allItems, rarityFilter, search]);

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

      {/* Search + rarity row */}
      <div className="flex gap-3 items-center">
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
      </div>

      {/* Stats line */}
      <div className="text-sm flex gap-2 items-center" style={{ color: "#9ca3af" }}>
        <span>{filtered.length} آیتم</span>
        <span>·</span>
        <span style={{ color: "#22c55e", fontWeight: 600 }}>{owned.size} دارم</span>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
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
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
        >
          {paged.map((item) => {
            const rarity = item.rarity?.value?.toLowerCase() ?? "common";
            const rColor = getRarityColor(rarity);
            const isOwned = owned.has(item.id);
            const imgSrc = item.images?.icon ?? item.images?.smallIcon;
            const nameFa = getItemNameFa(item.name);
            const isHovered = hoveredId === item.id;

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

                {/* Owned overlay */}
                {isOwned && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "#00000060" }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>✅</span>
                  </div>
                )}

                {/* Hover overlay */}
                {isHovered && !isOwned && (
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-opacity"
                    style={{ background: "#00000070" }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: rColor }}
                    >
                      + دارم
                    </span>
                  </div>
                )}
                {isHovered && isOwned && (
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-opacity"
                    style={{ background: "#00000080" }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: rColor }}
                    >
                      دارم ✓
                    </span>
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
