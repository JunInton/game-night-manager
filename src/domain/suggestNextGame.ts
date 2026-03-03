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
  weightPreference: "light" | "heavy" = "light",
  isSorted: boolean = false
): Game | null {
  if (games.length === 0) return null;

  // When the user has explicitly sorted the playlist, honour that order exactly.
  // games[0] is always the next intended game.
  if (isSorted) return games[0];

  let targetWeight: "light" | "heavy";

  if (!lastPlayed) {
    // First pick: use the preference directly.
    targetWeight = weightPreference;
  } else {
    // Subsequent picks: flip from whatever was last played.
    targetWeight = lastPlayed.weight === "heavy" ? "light" : "heavy";
  }

  const matching = games.filter(g => g.weight === targetWeight);

  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }

  // Fallback: no games of the preferred weight remain, pick from whatever is left
  return games[Math.floor(Math.random() * games.length)] ?? null;
}