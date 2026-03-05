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
  isSorted: boolean = false,
  skippedGame?: Game,
): Game | null {
  if (games.length === 0) return null;

  // When the user has explicitly sorted the playlist, honour that order exactly.
  // games[0] is always the next intended game.
  // If the front of the sorted list is the game we just skipped, take the next one.
  if (isSorted) {
    const next = skippedGame
      ? games.find(g => g.name !== skippedGame.name)
      : games[0];
    return next ?? null;
  }

  let targetWeight: "light" | "heavy";

  if (!lastPlayed) {
    // First pick: use the preference directly.
    targetWeight = weightPreference;
  } else {
    // Subsequent picks: flip from whatever was last played.
    targetWeight = lastPlayed.weight === "heavy" ? "light" : "heavy";
  }

  // Never suggest the game that was just skipped.
  const candidates = skippedGame
    ? games.filter(g => g.name !== skippedGame.name)
    : games;

  if (candidates.length === 0) return games[0] ?? null;

  const matching = candidates.filter(g => g.weight === targetWeight);

  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }

  // Fallback: no games of the preferred weight remain, pick from whatever is left
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}