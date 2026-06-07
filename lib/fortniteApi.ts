import { ShopItem, FortniteAPIShopResponse, Cosmetic, MapPOI } from "@/types";
import { getItemNameFa } from "./persianNames";

export const typeTranslations: Record<string, string> = {
  outfit:    "پوشاک",
  backpack:  "کوله‌پشتی",
  pickaxe:   "کلنگ",
  glider:    "چتر",
  contrail:  "اثر حرکتی",
  emote:     "احساسات",
  wrap:      "پوشش سلاح",
  loading:   "تصویر بارگذاری",
  banner:    "پرچم",
  spray:     "اسپری",
  toy:       "اسباب‌بازی",
  music:     "موزیک",
  bundle:    "بسته",
};

export const rarityTranslations: Record<string, string> = {
  common:                  "معمولی",
  uncommon:                "غیرمعمول",
  rare:                    "کمیاب",
  epic:                    "حماسی",
  legendary:               "افسانه‌ای",
  mythic:                  "اساطیری",
  "marvel series":         "مارول",
  "dc series":             "DC",
  "icon series":           "آیکون",
  "gaming legends series": "افسانه‌های گیمینگ",
  shadow:                  "سایه",
  slurp:                   "اسلرپ",
  frozen:                  "یخ‌زده",
  lava:                    "گدازه",
  dark:                    "تاریک",
  starwars:                "جنگ ستارگان",
  platform:                "پلتفرم",
};

export const sectionTranslations: Record<string, string> = {
  "Featured Items":   "آیتم‌های ویژه",
  "Daily Items":      "آیتم‌های روزانه",
  "Special Items":    "آیتم‌های خاص",
  "New Items":        "آیتم‌های جدید",
  "Icon Series":      "سری آیکون",
  "Gaming Legends":   "افسانه‌های گیمینگ",
  "Star Wars":        "جنگ ستارگان",
  "Marvel":           "مارول",
  "Starter Pack":     "بسته مبتدی",
  "Bundles":          "بسته‌ها",
};

export function translateSection(s?: string): string {
  if (!s) return "";
  return sectionTranslations[s] ?? s;
}

// ── CORS proxy chain ────────────────────────────────────────────────────────
async function tryCORS(url: string): Promise<unknown | null> {
  const t = 7000;
  const attempts = [
    async () => {
      const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(t) });
      if (!r.ok) throw new Error(`${r.status}`);
      return r.json();
    },
    async () => {
      const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
        cache: "no-store", signal: AbortSignal.timeout(t),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      return r.json();
    },
    async () => {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
        cache: "no-store", signal: AbortSignal.timeout(t),
      });
      if (!r.ok) throw new Error(`${r.status}`);
      const w = await r.json();
      return JSON.parse(w.contents);
    },
  ];
  for (const fn of attempts) {
    try { return await fn(); } catch { /* next proxy */ }
  }
  return null;
}

function parseShop(data: FortniteAPIShopResponse): ShopItem[] {
  const items: ShopItem[] = [];
  const seen = new Set<string>();

  for (const entry of data.data.entries) {
    if (!entry.items?.length) continue;
    const p = entry.items[0];
    if (seen.has(p.id)) continue;
    seen.add(p.id);

    const typeKey   = p.type?.value?.toLowerCase()   ?? "outfit";
    const rarityKey = p.rarity?.value?.toLowerCase() ?? "common";

    items.push({
      id:     p.id,
      name:   p.name,
      nameFa: getItemNameFa(p.name),
      type:   typeKey  as ShopItem["type"],
      rarity: rarityKey as ShopItem["rarity"],
      price:  entry.finalPrice,
      images: {
        icon:      p.images?.icon,
        featured:  p.images?.featured ?? p.images?.icon,
        smallIcon: p.images?.smallIcon,
        background:p.images?.background,
      },
      description:   p.description,
      descriptionFa: typeTranslations[typeKey] ?? typeKey,
      isBundle: !!entry.bundle,
      section:  entry.section?.name ?? entry.layout?.name,
    });
  }
  return items;
}

export async function fetchItemShop(): Promise<{ items: ShopItem[]; source: string }> {
  const data = await tryCORS("https://fortnite-api.com/v2/shop?language=en");
  if (data) {
    try {
      const parsed = parseShop(data as FortniteAPIShopResponse);
      if (parsed.length > 0) return { items: parsed, source: "live" };
    } catch { /* fall through */ }
  }
  return { items: getFallbackShopItems(), source: "offline" };
}

// ── News ────────────────────────────────────────────────────────────────────
export interface FortniteNews {
  id: string;
  title: string;
  body: string;
  image: string;
}

export async function fetchFortniteNews(): Promise<FortniteNews[]> {
  const data = await tryCORS("https://fortnite-api.com/v2/news/br?language=en");
  if (!data) return getFallbackNews();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const motds = (data as any)?.data?.motds ?? (data as any)?.data?.news?.motds ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return motds.slice(0, 6).map((m: any) => ({
      id:    m.id    ?? String(Math.random()),
      title: m.title ?? "",
      body:  m.body  ?? m.tabTitle ?? "",
      image: m.image ?? m.largeImage ?? "",
    }));
  } catch { return getFallbackNews(); }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
export function getRarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common:       "#b8c4c8",
    uncommon:     "#69be28",
    rare:         "#2d91ff",
    epic:         "#c05dff",
    legendary:    "#ff8000",
    mythic:       "#f0c132",
    marvel:       "#ed1d24",
    dc:           "#0075f5",
    icon:         "#23eebc",
    gaminglegends:"#6a0dad",
    shadow:       "#9ca3af",
    slurp:        "#00edff",
    frozen:       "#add8e6",
    lava:         "#ff4500",
    dark:         "#6600cc",
    starwars:     "#ffe81f",
    platform:     "#0078d7",
  };
  return map[rarity] ?? "#b8c4c8";
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

// ── Fallback shop items (real CDN IDs from fortnite-api.com) ─────────────────
const CDN = "https://fortnite-api.com/images/cosmetics/br";

function mkImg(id: string) {
  return {
    icon:      `${CDN}/${id}/icon.png`,
    featured:  `${CDN}/${id}/featured.png`,
    smallIcon: `${CDN}/${id}/smallIcon.png`,
  };
}

function getFallbackShopItems(): ShopItem[] {
  return [
    // ── Featured / ویژه ──────────────────────────────────────────────────────
    {
      id: "CID_030_Athena_Commando_M_Halloween",
      name: "Skull Trooper",      nameFa: "سرباز جمجمه",
      type: "outfit", rarity: "epic", price: 1500,
      images: mkImg("CID_030_Athena_Commando_M_Halloween"),
      descriptionFa: "پوشاک", section: "Featured Items",
    },
    {
      id: "CID_029_Athena_Commando_F_Halloween",
      name: "Ghoul Trooper",      nameFa: "سرباز غول",
      type: "outfit", rarity: "epic", price: 1500,
      images: mkImg("CID_029_Athena_Commando_F_Halloween"),
      descriptionFa: "پوشاک", section: "Featured Items",
    },
    {
      id: "CID_084_Athena_Commando_M_Medieval",
      name: "Black Knight",       nameFa: "شوالیه سیاه",
      type: "outfit", rarity: "legendary", price: 2000,
      images: mkImg("CID_084_Athena_Commando_M_Medieval"),
      descriptionFa: "پوشاک", section: "Featured Items",
    },
    {
      id: "CID_086_Athena_Commando_F_Medieval",
      name: "Red Knight",         nameFa: "شوالیه قرمز",
      type: "outfit", rarity: "legendary", price: 2000,
      images: mkImg("CID_086_Athena_Commando_F_Medieval"),
      descriptionFa: "پوشاک", section: "Featured Items",
    },
    // ── Daily outfits / روزانه ───────────────────────────────────────────────
    {
      id: "CID_162_Athena_Commando_F_Bullseye",
      name: "Bullseye",           nameFa: "هدف دقیق",
      type: "outfit", rarity: "rare", price: 1200,
      images: mkImg("CID_162_Athena_Commando_F_Bullseye"),
      descriptionFa: "پوشاک", section: "Daily Items",
    },
    {
      id: "CID_032_Athena_Commando_F_Medieval",
      name: "Blue Squire",        nameFa: "سرباز آبی",
      type: "outfit", rarity: "rare", price: 1200,
      images: mkImg("CID_032_Athena_Commando_F_Medieval"),
      descriptionFa: "پوشاک", section: "Daily Items",
    },
    {
      id: "CID_028_Athena_Commando_F",
      name: "Renegade",           nameFa: "شورشی",
      type: "outfit", rarity: "uncommon", price: 800,
      images: mkImg("CID_028_Athena_Commando_F"),
      descriptionFa: "پوشاک", section: "Daily Items",
    },
    {
      id: "CID_017_Athena_Commando_M",
      name: "Aerial Assault Trooper", nameFa: "سرباز هوایی",
      type: "outfit", rarity: "uncommon", price: 800,
      images: mkImg("CID_017_Athena_Commando_M"),
      descriptionFa: "پوشاک", section: "Daily Items",
    },
    // ── Emotes / احساسات ─────────────────────────────────────────────────────
    {
      id: "EID_Floss",
      name: "Floss",              nameFa: "فلاس",
      type: "emote", rarity: "rare", price: 500,
      images: mkImg("EID_Floss"),
      descriptionFa: "احساسات", section: "Daily Items",
    },
    {
      id: "EID_TakeTheL",
      name: "Take the L",         nameFa: "ببر L را",
      type: "emote", rarity: "rare", price: 500,
      images: mkImg("EID_TakeTheL"),
      descriptionFa: "احساسات", section: "Daily Items",
    },
    {
      id: "EID_OrangeJustice",
      name: "Orange Justice",     nameFa: "عدالت نارنجی",
      type: "emote", rarity: "rare", price: 500,
      images: mkImg("EID_OrangeJustice"),
      descriptionFa: "احساسات", section: "Daily Items",
    },
    {
      id: "EID_RideThePony",
      name: "Ride the Pony",      nameFa: "سواری بر اسب",
      type: "emote", rarity: "epic", price: 800,
      images: mkImg("EID_RideThePony"),
      descriptionFa: "احساسات", section: "Daily Items",
    },
    // ── Pickaxes / کلنگ ──────────────────────────────────────────────────────
    {
      id: "Pickaxe_Lockjaw",
      name: "Raider's Revenge",   nameFa: "انتقام غارتگر",
      type: "pickaxe", rarity: "uncommon", price: 500,
      images: mkImg("Pickaxe_Lockjaw"),
      descriptionFa: "کلنگ", section: "Daily Items",
    },
    {
      id: "Pickaxe_DualPick",
      name: "Dual Edge",          nameFa: "لبه دوگانه",
      type: "pickaxe", rarity: "uncommon", price: 500,
      images: mkImg("Pickaxe_DualPick"),
      descriptionFa: "کلنگ", section: "Daily Items",
    },
    // ── Gliders / چتر ───────────────────────────────────────────────────────
    {
      id: "Glider_Default",
      name: "Mako",               nameFa: "ماکو",
      type: "glider", rarity: "rare", price: 500,
      images: mkImg("Glider_Default"),
      descriptionFa: "چتر", section: "Daily Items",
    },
    {
      id: "Glider_Airhead",
      name: "Airhead",            nameFa: "سر هوایی",
      type: "glider", rarity: "uncommon", price: 300,
      images: mkImg("Glider_Airhead"),
      descriptionFa: "چتر", section: "Daily Items",
    },
    // ── Wraps / پوشش سلاح ───────────────────────────────────────────────────
    {
      id: "Wrap_010_Scales",
      name: "Dragon Scales",      nameFa: "فلس اژدها",
      type: "wrap", rarity: "rare", price: 300,
      images: mkImg("Wrap_010_Scales"),
      descriptionFa: "پوشش سلاح", section: "Daily Items",
    },
  ];
}

function getFallbackNews(): FortniteNews[] {
  return [
    {
      id: "n1",
      title: "فصل ۲ فصل ۷: یخ یا آشوب",
      body: "Dark Voyager با مکعب‌های آشوب بازگشته. تیم Foundation یا Ice King را انتخاب کن.",
      image: "",
    },
    {
      id: "n2",
      title: "رویداد جنگ ستارگان — Unleash the Force",
      body: "با Luke، Vader و Mandalorian بجنگ. نقشه‌های Galactic Siege، Escape Vader و Droid Tycoon فعال‌اند.",
      image: "",
    },
    {
      id: "n3",
      title: "آپدیت v33.10 — تعادل سلاح‌ها",
      body: "Scout Rifle بازگشت. شاتگان‌ها تنظیم شدند. باگ‌های رنک‌دار رفع شد.",
      image: "",
    },
    {
      id: "n4",
      title: "Battle Pass فصل ۷",
      body: "Foundation (Reforged)، Exalted Ice King و Elite Jules را آنلاک کن.",
      image: "",
    },
    {
      id: "n5",
      title: "هفته ۸ — نبرد نهایی",
      body: "کوئست‌های هفته ۸ فعال شد. یادبود Ice King را بشکن و Dark Voyager را شکست بده.",
      image: "",
    },
  ];
}

// ── Map ─────────────────────────────────────────────────────────────────────
export async function fetchMap(): Promise<{ images: { blank: string; pois: string }; pois: MapPOI[] } | null> {
  const data = await tryCORS("https://fortnite-api.com/v1/map?language=en");
  if (!data) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any).data ?? null;
  } catch { return null; }
}

// ── Cosmetics ────────────────────────────────────────────────────────────────
const _cosmeticsCache: Record<string, Cosmetic[]> = {};

export async function fetchCosmetics(type = "outfit"): Promise<Cosmetic[]> {
  if (_cosmeticsCache[type]) return _cosmeticsCache[type];
  const url = `https://fortnite-api.com/v2/cosmetics/br/search/all?type=${type}&language=en`;
  const data = await tryCORS(url);
  if (!data) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (data as any).data;
    const arr: Cosmetic[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    _cosmeticsCache[type] = [...arr].reverse();
    return _cosmeticsCache[type];
  } catch { return []; }
}
