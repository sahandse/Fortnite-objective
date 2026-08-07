"use client";

import { useMemo, useState } from "react";
import { ShopItem } from "@/types";
import {
  fetchItemShop,
  translateType,
  formatVBucks,
} from "@/lib/fortniteApi";
import ShopItemCard from "./ShopItemCard";
import Pagination from "./Pagination";

interface Props {
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}

const PAGE_SIZE = 20;

export default function ShopTab({ favorites, onToggleFavorite }: Props) {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [shopSource, setShopSource] = useState<"live" | "offline" | "cache" | null>(null);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopError, setShopError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [shopFilter, setShopFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const loadShop = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setShopLoading(true);
    setShopError(false);
    try {
      const result = await fetchItemShop();
      setShopItems(result.items);
      setShopSource(result.source as "live" | "offline" | "cache");
      setLastUpdated(new Date());
      setPage(1);
    } catch {
      setShopError(true);
    } finally {
      setShopLoading(false);
      setRefreshing(false);
    }
  };

  const filteredShop = useMemo(() => {
    if (shopFilter === "all") return shopItems;
    if (shopFilter === "favorites") return shopItems.filter((i) => favorites.has(i.id));
    return shopItems.filter((item) => item.type === shopFilter);
  }, [shopItems, shopFilter, favorites]);

  const shopTypes = useMemo(() => {
    const types = new Set(shopItems.map((i) => i.type));
    return ["all", "favorites", ...Array.from(types)];
  }, [shopItems]);

  const totalPages = Math.ceil(filteredShop.length / PAGE_SIZE);
  const pagedShop = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredShop.slice(start, start + PAGE_SIZE);
  }, [filteredShop, page]);

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="section-title">آیتم‌شاپ امروز</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
            {lastUpdated && (
              <span style={{ fontSize: 12, color: "var(--c-dim)" }}>
                {lastUpdated.toLocaleTimeString("fa-IR")}
              </span>
            )}
            {shopSource && (
              <span className={`badge ${shopSource === "live" ? "pill-live" : shopSource === "cache" ? "pill-live" : "pill-offline"}`}>
                {shopSource === "live" ? "🟢 لایو" : shopSource === "cache" ? "⚡ کش" : "📦 آفلاین"}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {shopItems.length > 0 && (
            <span style={{ fontSize: 13, color: "var(--c-muted)" }}>
              <strong style={{ color: "var(--c-text)" }}>{filteredShop.length}</strong> آیتم
            </span>
          )}
          <button
            onClick={() => loadShop(true)}
            disabled={refreshing || shopLoading}
            className="btn btn-ghost"
            style={{ padding: "6px 10px", fontSize: 12 }}
          >
            🔄
          </button>
        </div>
      </div>

      {shopItems.length > 0 && (
        <div className="tabs-scroll" style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
          {shopTypes.map((type) => (
            <button
              key={type}
              onClick={() => { setShopFilter(type); setPage(1); }}
              className={`filter-chip${shopFilter === type ? " active" : ""}`}
            >
              {type === "all" ? "همه" : type === "favorites"
                ? `⭐ علاقه‌مندی (${favorites.size})`
                : translateType(type)}
            </button>
          ))}
        </div>
      )}

      {shopLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              position: "relative", aspectRatio: "3/4", borderRadius: 14,
              background: "#090e1f", overflow: "hidden",
            }}>
              <div className="shimmer" style={{ position: "absolute", inset: 0 }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "8px 10px 10px",
                background: "linear-gradient(to bottom, transparent, rgba(5,8,16,0.95))",
                display: "flex", flexDirection: "column", gap: 5,
              }}>
                <div style={{ height: 11, borderRadius: 4, background: "rgba(255,255,255,0.07)", width: "80%" }} />
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)", width: "45%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : shopError ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--c-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>خطا در بارگذاری</p>
          <button onClick={() => loadShop()} className="btn btn-primary">تلاش مجدد</button>
        </div>
      ) : filteredShop.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--c-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <p>آیتمی یافت نشد</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
            {pagedShop.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                isFavorite={favorites.has(item.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination current={page} total={totalPages} onChange={setPage} />
          )}
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, borderTop: "1px solid var(--c-border)", flexWrap: "wrap" }}>
        <a href="https://fortnite.gg/shop" target="_blank" rel="noopener" className="btn btn-gradient">
          🛒 شاپ زنده در fortnite.gg
        </a>
        {shopSource === "offline" && (
          <span style={{ fontSize: 12, color: "var(--c-dim)" }}>
            آیتم‌های نمایشی نمونه هستند
          </span>
        )}
        <span style={{ fontSize: 12, color: "var(--c-dim)", marginRight: "auto" }}>
          داده از{" "}
          <a href="https://fortnite-api.com" target="_blank" rel="noopener"
            style={{ color: "var(--c-blue)", textDecoration: "none" }}>
            fortnite-api.com
          </a>
        </span>
      </div>
    </div>
  );
}