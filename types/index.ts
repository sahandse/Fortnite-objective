export type QuestCategory =
  | "daily"
  | "weekly"
  | "story"
  | "battlepass"
  | "ranked"
  | "event"
  | "milestone";

export type QuestRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Quest {
  id: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  category: QuestCategory;
  xpReward: number;
  target: number;
  targetUnit: string;
  week?: number;
  season?: string;
  tags: string[];
  isNew?: boolean;
}

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" | "marvel" | "dc" | "icon" | "gaminglegends" | "shadow" | "slurp" | "frozen" | "lava" | "dark" | "starwars" | "platform";

export type ItemType = "outfit" | "backpack" | "pickaxe" | "glider" | "contrail" | "emote" | "wrap" | "loading" | "banner" | "spray" | "toy" | "music" | "bundle";

export interface ShopItem {
  id: string;
  name: string;
  nameFa: string;
  type: ItemType;
  rarity: ItemRarity;
  price: number;
  images: {
    icon?: string;
    featured?: string;
    smallIcon?: string;
    background?: string;
  };
  description?: string;
  descriptionFa?: string;
  isBundle?: boolean;
  bundleItems?: string[];
  section?: string;
  lastSeen?: string;
}

export interface FortniteAPIShopResponse {
  status: number;
  data: {
    hash: string;
    date: string;
    entries: FortniteAPIShopEntry[];
  };
}

export interface FortniteAPIShopEntry {
  regularPrice: number;
  finalPrice: number;
  bundle?: {
    name: string;
    info: string;
    image: string;
  };
  banner?: {
    value: string;
    intensity: string;
    backendValue: string;
  };
  items: FortniteAPIItem[];
  layout?: {
    id: string;
    name: string;
    category: string;
    index: number;
    showIneligibleOffers: string;
    useWidePreview: boolean;
    displayType: string;
  };
  section?: {
    id: string;
    name: string;
    index: number;
    landingPriority: number;
    sortOffersByPrice: boolean;
    showTimer: boolean;
    enableToastNotification: boolean;
    background: string;
  };
}

export interface MapPOI {
  id: string;
  name: string;
  location: { x: number; y: number; z: number };
}

export interface Cosmetic {
  id: string;
  name: string;
  description?: string;
  type: { value: string; displayValue: string; backendValue: string };
  rarity: { value: string; displayValue: string; backendValue: string };
  images: { smallIcon?: string; icon?: string; featured?: string };
  set?: { value: string; text: string; backendValue: string } | null;
  series?: { value: string; image: string; colors: string[]; backendValue: string } | null;
  added?: string;
}

export interface FortniteAPIItem {
  id: string;
  name: string;
  description: string;
  type: {
    value: string;
    displayValue: string;
    backendValue: string;
  };
  rarity: {
    value: string;
    displayValue: string;
    backendValue: string;
  };
  series?: {
    value: string;
    image: string;
    colors: string[];
    backendValue: string;
  };
  set?: {
    value: string;
    text: string;
    backendValue: string;
  };
  images: {
    smallIcon: string;
    icon: string;
    featured?: string;
    background?: string;
    other?: {
      [key: string]: string;
    };
  };
  video?: string;
  gameplayTags?: string[];
}
