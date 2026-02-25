import type { Game } from "./types";

// weightPreference meaning:
//   "light"  → prefer light games  (first pick = light, then alternates: heavy, light, ...)
//   "heavy"  → prefer heavy games  (first pick = heavy, then alternates: light, heavy, ...)
//
// There is no "auto" / null mode anymore — the playlist screen always has a preference set.
// The default is "light" (Light → Heavy).

export default function suggestNextGame(
  games: Game[],
  lastPlayed?: Game,
  weightPreference: "light" | "heavy" = "light"
): Game | null {
  if (games.length === 0) return null;

  let targetWeight: "light" | "heavy";

  if (!lastPlayed) {
    // First pick: use the preference directly.
    // "light" → start with a light game; "heavy" → start with a heavy game.
    targetWeight = weightPreference;
  } else {
    // Subsequent picks: alternate from whatever was last played,
    // but honour the preference direction when both weights are available.
    // Simple rule: flip from last played.
    targetWeight = lastPlayed.weight === "heavy" ? "light" : "heavy";
  }

  const matching = games.filter(g => g.weight === targetWeight);

  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }

  // Fallback: no games of the preferred weight remain, pick from whatever is left
  return games[Math.floor(Math.random() * games.length)] ?? null;
}