import type { Game } from "./types";

export default function suggestNextGame(
  games: Game[],
  lastPlayed?: Game
): Game | null {
  if (games.length === 0) return null;

  if (!lastPlayed) return games[0] ?? null;

  if (lastPlayed.weight === "heavy") {
    return games.find(g => g.weight === "light") ?? null;
  }

  return games.find(g => g.weight === "heavy") ?? null;
}