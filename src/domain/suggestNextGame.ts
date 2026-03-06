import type { Game } from "./types";

// ─── Weight preference ────────────────────────────────────────────────────────
// "light"  → prefer light games  (first pick = light, then alternates: heavy, light, …)
// "heavy"  → prefer heavy games  (first pick = heavy, then alternates: light, heavy, …)
//
// There is no "auto" / null mode anymore — PlaylistScreen always sets a preference.
// The default is "light" (Light → Heavy).

export default function suggestNextGame(
  games: Game[],
  lastPlayed?: Game,
  weightPreference: "light" | "heavy" = "light",
  isSorted: boolean = false,
  skippedGame?: Game,
): Game | null {
  // Nothing to suggest if the pool is empty.
  if (games.length === 0) return null;

  // ── Sorted mode ────────────────────────────────────────────────────────────
  // When the user has explicitly sorted the playlist on PlaylistScreen, we
  // honour that order exactly instead of running the weight-alternating logic.
  // games[0] is always the next intended game.
  // If the front of the sorted list is the game we just skipped, take the
  // next one so the skipped game isn't immediately re-suggested.
  if (isSorted) {
    const next = skippedGame
      ? games.find(g => g.name !== skippedGame.name)
      : games[0];
    return next ?? null;
  }

  // ── Weight targeting ────────────────────────────────────────────────────────
  // First pick: use the preference directly (start with whatever the user chose).
  // Subsequent picks: flip from whatever was last played, so the session
  // naturally alternates between light and heavy games.
  let targetWeight: "light" | "heavy";

  if (!lastPlayed) {
    targetWeight = weightPreference;
  } else {
    // If we just played heavy, aim for light next (and vice versa).
    targetWeight = lastPlayed.weight === "heavy" ? "light" : "heavy";
  }

  // ── Candidate filtering ─────────────────────────────────────────────────────
  // Never suggest the game that was just skipped — it's been reinserted later
  // in the queue by reinsertSkipped and will resurface on its own.
  const candidates = skippedGame
    ? games.filter(g => g.name !== skippedGame.name)
    : games;

  // Guard: if filtering removed everything (only one game and it was skipped),
  // fall back to the full pool so we never return null prematurely.
  if (candidates.length === 0) return games[0] ?? null;

  // Pick a random game from the matching-weight candidates.
  const matching = candidates.filter(g => g.weight === targetWeight);

  if (matching.length > 0) {
    // Math.random() returns [0, 1), so Math.floor gives a valid index.
    return matching[Math.floor(Math.random() * matching.length)];
  }

  // ── Fallback ─────────────────────────────────────────────────────────────────
  // No games of the preferred weight remain (e.g. all heavy games are done).
  // Pick randomly from whatever is left rather than returning null.
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}