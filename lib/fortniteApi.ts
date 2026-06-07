import { ShopItem, FortniteAPIShopResponse } from "@/types";

export const typeTranslations: Record<string, string> = {
  outfit: "پوشاک",
  backpack: "کوله‌پشتی",
  pickaxe: "کلنگ",
  glider: "چتر",
  contrail: "اثر حرکتی",
  emote: "احساسات",
  wrap: "پوشش سلاح",
  loading: "تصویر بارگذاری",
  banner: "پرچم",
  spray: "اسپری",
  toy: "اسباب‌بازی",
  music: "موزیک",
  bundle: "بسته",
};

export const rarityTranslations: Record<string, string> = {
  common: "معمولی",
  uncommon: "غیرمعمول",
  rare: "کمیاب",
  epic: "حماسی",
  legendary: "افسانه‌ای",
  mythic: "اساطیری",
  "marvel series": "Marvel",
  "dc series": "DC",
  "icon series": "آیکون",
  "gaming legends series": "افسانه‌های گیمینگ",
};

// --- CORS-aware fetch with proxy fallback chain ---
async function fetchWithProxy(url: string): Promise<unknown | null> {
  const timeout = 7000;

  const attempts = [
    // 1. Direct (works if API allows browser CORS)
    async () => {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(timeout) });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    // 2. corsproxy.io
    async () => {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(timeout),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    // 3. allorigins.win (wraps in { contents: string })
    async () => {
      const res = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        { cache: "no-store", signal: AbortSignal.timeout(timeout) }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const wrapper = await res.json();
      return JSON.parse(wrapper.contents);
    },
  ];

  for (const attempt of attempts) {
    try {
      const data = await attempt();
      return data;
    } catch {
      // try next proxy
    }
  }
  return null;
}

function parseShopEntries(data: FortniteAPIShopResponse): ShopItem[] {
  const items: ShopItem[] = [];
  const seen = new Set<string>();

  for (const entry of data.data.entries) {
    if (!entry.items?.length) continue;
    const primary = entry.items[0];
    if (seen.has(primary.id)) continue;
    seen.add(primary.id);

    const typeKey = primary.type?.value?.toLowerCase() ?? "outfit";
    const rarityKey = primary.rarity?.value?.toLowerCase() ?? "common";

    items.push({
      id: primary.id,
      name: primary.name,
      nameFa: primary.name,
      type: typeKey as ShopItem["type"],
      rarity: rarityKey as ShopItem["rarity"],
      price: entry.finalPrice,
      images: {
        icon: primary.images?.icon,
        featured: primary.images?.featured ?? primary.images?.icon,
        smallIcon: primary.images?.smallIcon,
        background: primary.images?.background,
      },
      description: primary.description,
      descriptionFa: typeTranslations[typeKey] ?? typeKey,
      isBundle: !!entry.bundle,
      section: entry.section?.name ?? entry.layout?.name,
    });
  }
  return items;
}

export async function fetchItemShop(): Promise<{ items: ShopItem[]; source: string }> {
  const data = await fetchWithProxy("https://fortnite-api.com/v2/shop?language=en");

  if (data) {
    try {
      const parsed = parseShopEntries(data as FortniteAPIShopResponse);
      if (parsed.length > 0) return { items: parsed, source: "live" };
    } catch {
      // bad parse
    }
  }

  return { items: getFallbackShopItems(), source: "offline" };
}

export async function fetchFortniteNews(): Promise<FortniteNews[]> {
  const data = await fetchWithProxy("https://fortnite-api.com/v2/news/br?language=en");
  if (!data) return getFallbackNews();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any;
    const motds = d?.data?.motds ?? d?.data?.news?.motds ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return motds.slice(0, 6).map((m: any) => ({
      id: m.id ?? Math.random().toString(),
      title: m.title ?? "",
      body: m.body ?? m.tabTitle ?? "",
      image: m.image ?? m.largeImage ?? "",
    }));
  } catch {
    return getFallbackNews();
  }
}

export interface FortniteNews {
  id: string;
  title: string;
  body: string;
  image: string;
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "#b8c4c8",
    uncommon: "#69be28",
    rare: "#2d91ff",
    epic: "#c05dff",
    legendary: "#ff8000",
    mythic: "#f0c132",
    marvel: "#ed1d24",
    dc: "#0075f5",
    icon: "#23eebc",
    gaminglegends: "#6a0dad",
    shadow: "#9ca3af",
    slurp: "#00edff",
    frozen: "#add8e6",
    lava: "#ff4500",
    dark: "#6600cc",
    starwars: "#ffe81f",
    platform: "#0078d7",
  };
  return colors[rarity] ?? "#b8c4c8";
}

export function translateRarity(rarity: string): string {
  return rarityTranslations[rarity] ?? rarity;
}

export function translateType(type: string): string {
  return typeTranslations[type] ?? type;
}

export function formatVBucks(price: number): string {
  return price.toLocaleString("en-US");
}

// Realistic fallback items with working CDN images
function getFallbackShopItems(): ShopItem[] {
  return [
    {
      id: "CID_162_Athena_Commando_F_Bullseye",
      name: "Bullseye",
      nameFa: "تیرانداز",
      type: "outfit",
      rarity: "rare",
      price: 1200,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/CID_162_Athena_Commando_F_Bullseye/icon.png",
        featured: "https://media.fortniteapi.io/images/cosmetics/br/CID_162_Athena_Commando_F_Bullseye/featured.png",
      },
      descriptionFa: "پوشاک",
      section: "Featured Items",
    },
    {
      id: "CID_017_Athena_Commando_M",
      name: "Aerial Assault Trooper",
      nameFa: "سرباز هوایی",
      type: "outfit",
      rarity: "uncommon",
      price: 800,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/CID_017_Athena_Commando_M/icon.png",
      },
      descriptionFa: "پوشاک",
      section: "Daily Items",
    },
    {
      id: "EID_Floss",
      name: "Floss",
      nameFa: "فلاس",
      type: "emote",
      rarity: "rare",
      price: 500,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/EID_Floss/icon.png",
      },
      descriptionFa: "احساسات",
      section: "Daily Items",
    },
    {
      id: "EID_TakeTheL",
      name: "Take The L",
      nameFa: "ببر L را",
      type: "emote",
      rarity: "rare",
      price: 500,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/EID_TakeTheL/icon.png",
      },
      descriptionFa: "احساسات",
      section: "Daily Items",
    },
    {
      id: "Pickaxe_DualEdge",
      name: "Dual Edge",
      nameFa: "لبه دوگانه",
      type: "pickaxe",
      rarity: "uncommon",
      price: 500,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/Pickaxe_DualEdge/icon.png",
      },
      descriptionFa: "کلنگ",
      section: "Daily Items",
    },
    {
      id: "Glider_Airhead",
      name: "Airhead",
      nameFa: "سر هوایی",
      type: "glider",
      rarity: "uncommon",
      price: 500,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/Glider_Airhead/icon.png",
      },
      descriptionFa: "چتر",
      section: "Daily Items",
    },
    {
      id: "CID_315_Athena_Commando_M_TeriyakiFish",
      name: "Moisty Merman",
      nameFa: "موجود دریایی",
      type: "outfit",
      rarity: "epic",
      price: 1500,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/CID_315_Athena_Commando_M_TeriyakiFish/icon.png",
        featured: "https://media.fortniteapi.io/images/cosmetics/br/CID_315_Athena_Commando_M_TeriyakiFish/featured.png",
      },
      descriptionFa: "پوشاک",
      section: "Featured Items",
    },
    {
      id: "CID_116_Athena_Commando_M_Carbide",
      name: "Carbide",
      nameFa: "کاربید",
      type: "outfit",
      rarity: "legendary",
      price: 2000,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/CID_116_Athena_Commando_M_Carbide/icon.png",
        featured: "https://media.fortniteapi.io/images/cosmetics/br/CID_116_Athena_Commando_M_Carbide/featured.png",
      },
      descriptionFa: "پوشاک",
      section: "Featured Items",
    },
    {
      id: "CID_120_Athena_Commando_F_Omega",
      name: "Omega",
      nameFa: "امگا",
      type: "outfit",
      rarity: "legendary",
      price: 2000,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/CID_120_Athena_Commando_F_Omega/icon.png",
        featured: "https://media.fortniteapi.io/images/cosmetics/br/CID_120_Athena_Commando_F_Omega/featured.png",
      },
      descriptionFa: "پوشاک",
      section: "Featured Items",
    },
    {
      id: "Wrap_056_RoadTrip",
      name: "Dragon Scales",
      nameFa: "فلس اژدها",
      type: "wrap",
      rarity: "rare",
      price: 300,
      images: {
        icon: "https://media.fortniteapi.io/images/cosmetics/br/Wrap_056_RoadTrip/icon.png",
      },
      descriptionFa: "پوشش سلاح",
      section: "Daily Items",
    },
  ];
}

function getFallbackNews(): FortniteNews[] {
  return [
    {
      id: "news-1",
      title: "فصل ۲ فصل ۷: اتحاد یا فتح",
      body: "با Dark Voyager روبرو شو و مکعب‌های آشوب را جمع‌آوری کن. آینده جزیره در دستان توست.",
      image: "",
    },
    {
      id: "news-2",
      title: "رویداد جنگ ستارگان",
      body: "با Luke Skywalker، Darth Vader و R2-D2 بجنگ. نقشه‌های خلاقانه Star Wars فعال شدند.",
      image: "",
    },
    {
      id: "news-3",
      title: "آپدیت v33.10",
      body: "تعادل سلاح‌ها بهبود یافت. اسکاوت ریفل باز شد. باگ‌های رنک‌دار رفع شدند.",
      image: "",
    },
    {
      id: "news-4",
      title: "Battle Pass جدید",
      body: "Foundation (Reforged)، Exalted Ice King و Elite Jules را آنلاک کن.",
      image: "",
    },
  ];
}
