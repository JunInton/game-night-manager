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
  const remaining = games.filter(g => g.name !== skipped.name);
  if (remaining.length === 0) return [skipped];
  const insertAt = Math.floor(Math.random() * remaining.length) + 1;
  return [...remaining.slice(0, insertAt), skipped, ...remaining.slice(insertAt)];
}