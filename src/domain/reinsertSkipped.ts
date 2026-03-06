import type { Game } from "./types";

/**
 * Removes the skipped game from the queue (by name, not position) and reinserts
 * it at a random position after the front, so it can resurface later but never
 * immediately reappears as the next suggestion.
 *
 * If the skipped game is the only one in the queue, it's returned as-is — the
 * caller is responsible for detecting this (otherGames.length === 0) and disabling
 * the Skip button before this situation can arise.
 */
export default function reinsertSkipped(games: Game[], skipped: Game): Game[] {
  // Remove the skipped game from wherever it currently sits in the list.
  const remaining = games.filter(g => g.name !== skipped.name);

  // Edge case: nothing left after removing — just return the skipped game alone.
  if (remaining.length === 0) return [skipped];

  // Pick a random insertion slot that is NOT position 0.
  // Math.random() * remaining.length gives [0, remaining.length),
  // adding 1 shifts the range to [1, remaining.length] — never the front.
  // So the skipped game is guaranteed to be at least one slot back.
  const insertAt = Math.floor(Math.random() * remaining.length) + 1;

  // Rebuild the array: everything before insertAt, then the skipped game,
  // then everything from insertAt onward.
  return [...remaining.slice(0, insertAt), skipped, ...remaining.slice(insertAt)];
}