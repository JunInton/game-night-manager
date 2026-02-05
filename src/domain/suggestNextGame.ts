import type { Game } from "./types";

export default function suggestNextGame(
  games: Game[],
  lastPlayed?: Game,
  weightPreference?: "light" | "heavy" | null
): Game | null {
  if (games.length === 0) return null;

  // If no game has been played yet, randomly select from all available games
  if (!lastPlayed) {
    const randomIndex = Math.floor(Math.random() * games.length);
    return games[randomIndex] ?? null;
  }

  // Determine target weight
  let targetWeight: "light" | "heavy";
  
  if (weightPreference === "light" || weightPreference === "heavy") {
    // User has set a specific preference
    targetWeight = weightPreference;
  } else {
    // Auto mode: alternate based on last played
    targetWeight = lastPlayed.weight === "heavy" ? "light" : "heavy";
  }

  // Filter games by target weight
  const matchingWeightGames = games.filter(g => g.weight === targetWeight);

  // If there are games with the target weight, randomly select one
  if (matchingWeightGames.length > 0) {
    const randomIndex = Math.floor(Math.random() * matchingWeightGames.length);
    return matchingWeightGames[randomIndex] ?? null;
  }

  // If no games with target weight exist, randomly select from remaining games
  const randomIndex = Math.floor(Math.random() * games.length);
  return games[randomIndex] ?? null;
}