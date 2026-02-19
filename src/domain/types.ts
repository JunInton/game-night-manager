export type Game = {
  name: string;
  weight: "light" | "heavy";
  bggId?: string; // BGG game ID for fetching more details later
  imageUrl?: string; // URL to the game's image
};