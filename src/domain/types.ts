export type Game = {
  name: string;
  weight: "light" | "heavy";
  bggId?: string; // BGG game ID for fetching more details later
  imageUrl?: string; // Full-res image URL from BGG
  thumbnailUrl?: string; // Small square thumbnail URL from BGG
  playingTime?: number; // Playing time in minutes
};