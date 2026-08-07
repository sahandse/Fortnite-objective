let PERSIAN_NAMES_CACHE: Record<string, string> | null = null;

async function loadPersianNames(): Promise<Record<string, string>> {
  if (PERSIAN_NAMES_CACHE) return PERSIAN_NAMES_CACHE;
  try {
    const res = await fetch("/Fortnite-objective/data/persianNames.json", { cache: "force-cache" });
    if (!res.ok) throw new Error("Failed to load");
    PERSIAN_NAMES_CACHE = await res.json();
    return PERSIAN_NAMES_CACHE;
  } catch {
    return {};
  }
}

export async function getItemNameFa(nameEn: string): Promise<string> {
  const names = await loadPersianNames();
  if (names[nameEn]) return names[nameEn];

  for (const [key, val] of Object.entries(names)) {
    if (nameEn.toLowerCase().includes(key.toLowerCase()) && key.length > 4) {
      return val;
    }
  }

  return nameEn;
}
