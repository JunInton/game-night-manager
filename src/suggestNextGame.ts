type Game = {
  name: string;
  weight: "light" | "heavy";
}

export default function suggestNextGame(
  games: Game[],
  lastPlayed?: Game
): Game | undefined {
  if (!lastPlayed) return games[0];

  if (lastPlayed.weight === "heavy") {
    return games.find(g = games.weight === "light");
  }

  return games.find(g => g.weight === "heavy");
}