export type RegionId =
  | "USA"
  | "LATIN"
  | "EUROPE"
  | "AFRICA"
  | "MENA"
  | "ASIA"
  | "GLOBAL";

export type RegionInfo = {
  id: RegionId;
  label: string;
  emoji: string;
  artists: string[];
  trendingQuery: string;
};

export const REGIONS: Record<RegionId, RegionInfo> = {
  USA: {
    id: "USA",
    label: "USA & Canada",
    emoji: "🇺🇸",
    trendingQuery: "top hits USA",
    artists: [
      "Drake",
      "Taylor Swift",
      "Kendrick Lamar",
      "The Weeknd",
      "Beyoncé",
      "SZA",
      "Travis Scott",
      "Billie Eilish",
      "Bruno Mars",
      "Post Malone",
      "Doja Cat",
      "Eminem",
    ],
  },
  LATIN: {
    id: "LATIN",
    label: "Latin America",
    emoji: "🌎",
    trendingQuery: "exitos latinos reggaeton",
    artists: [
      "Bad Bunny",
      "Karol G",
      "Peso Pluma",
      "Shakira",
      "Feid",
      "Rauw Alejandro",
      "Maluma",
      "J Balvin",
      "Anuel AA",
      "Rosalía",
      "Ozuna",
      "Grupo Frontera",
    ],
  },
  EUROPE: {
    id: "EUROPE",
    label: "Europe",
    emoji: "🇪🇺",
    trendingQuery: "top hits Europe",
    artists: [
      "Ed Sheeran",
      "Dua Lipa",
      "Adele",
      "David Guetta",
      "Aya Nakamura",
      "Ninho",
      "Central Cee",
      "Måneskin",
      "Stromae",
      "Coldplay",
      "Rosalía",
      "Sfera Ebbasta",
    ],
  },
  AFRICA: {
    id: "AFRICA",
    label: "Africa",
    emoji: "🌍",
    trendingQuery: "afrobeats hits",
    artists: [
      "Burna Boy",
      "Wizkid",
      "Davido",
      "Rema",
      "Tems",
      "Asake",
      "Ayra Starr",
      "Black Coffee",
      "Tyla",
      "Diamond Platnumz",
      "Fally Ipupa",
      "Amadou & Mariam",
    ],
  },
  MENA: {
    id: "MENA",
    label: "North Africa & Middle East",
    emoji: "🌙",
    trendingQuery: "اغاني عربية 2025",
    artists: [
      "Saad Lamjarred",
      "ElGrandeToto",
      "Amr Diab",
      "Nancy Ajram",
      "Cheb Khaled",
      "Soolking",
      "Mohamed Ramadan",
      "Balti",
      "7-Toun",
      "Dystinct",
      "Cheb Mami",
      "Fairuz",
    ],
  },
  ASIA: {
    id: "ASIA",
    label: "Asia",
    emoji: "🌏",
    trendingQuery: "asian pop hits",
    artists: [
      "BTS",
      "BLACKPINK",
      "Arijit Singh",
      "NewJeans",
      "Jubin Nautiyal",
      "Stray Kids",
      "AR Rahman",
      "IU",
      "Diljit Dosanjh",
      "Anirudh Ravichander",
      "Yoasobi",
      "Sidhu Moose Wala",
    ],
  },
  GLOBAL: {
    id: "GLOBAL",
    label: "Global",
    emoji: "🌐",
    trendingQuery: "global top songs",
    artists: [
      "The Weeknd",
      "Bad Bunny",
      "Dua Lipa",
      "Burna Boy",
      "Taylor Swift",
      "BTS",
      "Ed Sheeran",
      "Rihanna",
      "Drake",
      "Karol G",
      "Coldplay",
      "Eminem",
    ],
  },
};

export const GENRES = [
  { id: "pop", label: "Pop", query: "pop hits mix", emoji: "✨" },
  { id: "hiphop", label: "Hip-Hop / Rap", query: "hip hop rap hits", emoji: "🎤" },
  { id: "rnb", label: "R&B / Soul", query: "rnb soul mix", emoji: "💜" },
  { id: "afrobeats", label: "Afrobeats", query: "afrobeats mix", emoji: "🥁" },
  { id: "raiarab", label: "Rai & Arabic", query: "rai arabic music mix", emoji: "🌙" },
  { id: "latin", label: "Latin / Reggaeton", query: "reggaeton latino mix", emoji: "💃" },
  { id: "electronic", label: "Electronic / EDM", query: "edm electronic mix", emoji: "🎛️" },
  { id: "rock", label: "Rock", query: "rock classics mix", emoji: "🎸" },
  { id: "kpop", label: "K-Pop", query: "kpop hits mix", emoji: "🩷" },
  { id: "chill", label: "Chill / Lofi", query: "lofi chill beats", emoji: "🌙" },
  { id: "jazz", label: "Jazz", query: "smooth jazz mix", emoji: "🎷" },
  { id: "classical", label: "Classical", query: "classical music mix", emoji: "🎻" },
  { id: "amapiano", label: "Amapiano", query: "amapiano mix", emoji: "🔊" },
  { id: "indie", label: "Indie", query: "indie hits mix", emoji: "🌿" },
] as const;

export type GenreId = (typeof GENRES)[number]["id"];

const AFRICA_CODES = new Set([
  "NG", "GH", "ZA", "KE", "TZ", "UG", "SN", "CI", "CM", "ET", "ZW", "ZM", "AO", "MZ", "RW",
  "BJ", "BF", "ML", "NE", "TD", "CD", "CG", "GA", "GN", "TG", "SL", "LR", "BW", "NA", "MW",
  "SO", "SS", "BI", "GM", "MR", "CV", "GQ", "MG", "MU",
]);
const MENA_CODES = new Set([
  "MA", "DZ", "TN", "LY", "EG", "SA", "AE", "QA", "KW", "BH", "OM", "JO", "LB", "SY", "IQ",
  "YE", "PS", "SD", "TR", "IR",
]);
const EUROPE_CODES = new Set([
  "GB", "IE", "FR", "DE", "ES", "PT", "IT", "NL", "BE", "LU", "CH", "AT", "SE", "NO", "DK",
  "FI", "IS", "PL", "CZ", "SK", "HU", "RO", "BG", "GR", "HR", "SI", "RS", "BA", "MK", "AL",
  "ME", "UA", "BY", "RU", "LT", "LV", "EE", "MD", "MT", "CY",
]);
const USA_CODES = new Set(["US", "CA"]);
const LATIN_CODES = new Set([
  "MX", "BR", "AR", "CO", "CL", "PE", "VE", "EC", "BO", "PY", "UY", "CR", "PA", "DO", "GT",
  "HN", "SV", "NI", "CU", "PR", "JM",
]);
const ASIA_CODES = new Set([
  "IN", "PK", "BD", "LK", "NP", "CN", "JP", "KR", "TW", "HK", "SG", "MY", "ID", "TH", "PH",
  "VN", "KH", "MM", "KZ", "UZ", "AZ", "AF",
]);

export function regionFromCountry(country?: string | null): RegionId {
  const code = (country ?? "").toUpperCase();
  if (USA_CODES.has(code)) return "USA";
  if (MENA_CODES.has(code)) return "MENA";
  if (AFRICA_CODES.has(code)) return "AFRICA";
  if (EUROPE_CODES.has(code)) return "EUROPE";
  if (LATIN_CODES.has(code)) return "LATIN";
  if (ASIA_CODES.has(code)) return "ASIA";
  return "GLOBAL";
}

export function defaultLanguageForRegion(region: RegionId): "en" | "ar" | "fr" | "es" {
  if (region === "MENA") return "ar";
  if (region === "LATIN") return "es";
  return "en";
}

export function otherRegions(region: RegionId): RegionId[] {
  return (Object.keys(REGIONS) as RegionId[]).filter((r) => r !== region && r !== "GLOBAL");
}
