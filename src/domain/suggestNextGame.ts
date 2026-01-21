import type { Game } from "./types";

export default function suggestNextGame(
  games: Game[],
  lastPlayed?: Game
): Game | undefined {
  if (!lastPlayed) return games[0];

  if (lastPlayed.weight === "heavy") {
    return games.find(g => g.weight === "light");
  }

  return games.find(g => g.weight === "heavy");
}