/**
 * Preset avatar image URLs (DiceBear Lorelei – illustrated, polished style).
 * Users can pick one instead of uploading. Each URL is deterministic and cacheable.
 */
const SEEDS = [
  "Luna",
  "Kai",
  "Zara",
  "Felix",
  "Maya",
  "Leo",
  "Ivy",
  "Oscar",
  "Nova",
  "Ezra",
  "Aria",
  "Finn",
  "Ruby",
  "Theo",
  "Sage",
  "Jasper",
  "Willow",
  "Arlo",
  "Stella",
  "River",
  "Hazel",
  "Phoenix",
  "Iris",
  "Orion",
];

const BASE = "https://api.dicebear.com/7.x/lorelei/svg";

export const PRESET_AVATAR_URLS: string[] = SEEDS.map(
  (seed) => `${BASE}?seed=${encodeURIComponent(seed)}`
);

export function getPresetAvatarUrl(seed: string): string {
  return `${BASE}?seed=${encodeURIComponent(seed)}`;
}
