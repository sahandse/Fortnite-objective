import { ShopItem, FortniteAPIShopResponse } from "@/types";

const typeTranslations: Record<string, string> = {
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

const rarityTranslations: Record<string, string> = {
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

export async function fetchItemShop(): Promise<ShopItem[]> {
  try {
    const res = await fetch("https://fortnite-api.com/v2/shop?language=en", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: FortniteAPIShopResponse = await res.json();

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
  } catch {
    return getFallbackShopItems();
  }
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
    gaminglegends: "#1a0a33",
    shadow: "#36393f",
    slurp: "#00edff",
    frozen: "#add8e6",
    lava: "#ff4500",
    dark: "#1a0a33",
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

function getFallbackShopItems(): ShopItem[] {
  return [
    {
      id: "fallback-001",
      name: "Peely",
      nameFa: "پیلی",
      type: "outfit",
      rarity: "epic",
      price: 1500,
      images: {
        icon: "https://fortnite-api.com/images/cosmetics/br/cid_peely_v2_athena_commando_m_bananaagent/icon.png",
        featured: "https://fortnite-api.com/images/cosmetics/br/cid_peely_v2_athena_commando_m_bananaagent/featured.png",
      },
      description: "Going bananas.",
      descriptionFa: "داره دیوونه می‌شه",
      section: "Featured Items",
    },
    {
      id: "fallback-002",
      name: "Midas",
      nameFa: "میداس",
      type: "outfit",
      rarity: "legendary",
      price: 2000,
      images: {
        icon: "https://fortnite-api.com/images/cosmetics/br/cid_midas_athena_commando_m_secretagent/icon.png",
        featured: "https://fortnite-api.com/images/cosmetics/br/cid_midas_athena_commando_m_secretagent/featured.png",
      },
      description: "Everything he touches turns to gold.",
      descriptionFa: "هر چیزی که لمس کند طلا می‌شود",
      section: "Featured Items",
    },
    {
      id: "fallback-003",
      name: "Sparkle Specialist",
      nameFa: "متخصص درخشش",
      type: "outfit",
      rarity: "rare",
      price: 1200,
      images: {
        icon: "https://fortnite-api.com/images/cosmetics/br/cid_sparkle_specialist_athena_a_f_streetwear/icon.png",
      },
      description: "Ready to shine.",
      descriptionFa: "آماده درخشش",
      section: "Daily Items",
    },
    {
      id: "fallback-004",
      name: "Floss",
      nameFa: "فلاس",
      type: "emote",
      rarity: "rare",
      price: 500,
      images: {
        icon: "https://fortnite-api.com/images/cosmetics/br/eid_floss/icon.png",
      },
      description: "The signature Fortnite dance.",
      descriptionFa: "رقص معروف فورتنایت",
      section: "Daily Items",
    },
    {
      id: "fallback-005",
      name: "Blue Streak",
      nameFa: "خط آبی",
      type: "glider",
      rarity: "uncommon",
      price: 500,
      images: {
        icon: "https://fortnite-api.com/images/cosmetics/br/glider_blue_streak/icon.png",
      },
      description: "Speed of light.",
      descriptionFa: "با سرعت نور",
      section: "Daily Items",
    },
    {
      id: "fallback-006",
      name: "Raider's Revenge",
      nameFa: "انتقام غارتگر",
      type: "pickaxe",
      rarity: "uncommon",
      price: 500,
      images: {
        icon: "https://fortnite-api.com/images/cosmetics/br/pickaxe_lockjaw/icon.png",
      },
      description: "No mercy.",
      descriptionFa: "بدون رحم",
      section: "Daily Items",
    },
    {
      id: "fallback-007",
      name: "Drift",
      nameFa: "دریفت",
      type: "outfit",
      rarity: "legendary",
      price: 2000,
      images: {
        icon: "https://fortnite-api.com/images/cosmetics/br/cid_drift_athena_commando_m/icon.png",
        featured: "https://fortnite-api.com/images/cosmetics/br/cid_drift_athena_commando_m/featured.png",
      },
      description: "Riding the drift.",
      descriptionFa: "سوار بر دریفت",
      section: "Featured Items",
    },
    {
      id: "fallback-008",
      name: "Calamity",
      nameFa: "بلا",
      type: "outfit",
      rarity: "legendary",
      price: 2000,
      images: {
        icon: "https://fortnite-api.com/images/cosmetics/br/cid_calamity_athena_commando_f/icon.png",
        featured: "https://fortnite-api.com/images/cosmetics/br/cid_calamity_athena_commando_f/featured.png",
      },
      description: "Born in the storm.",
      descriptionFa: "در طوفان متولد شد",
      section: "Featured Items",
    },
  ];
}
