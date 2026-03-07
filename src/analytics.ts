import posthog from "posthog-js";
import type { Game } from "./domain/types";

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------
// Called once at app start-up (see main.tsx or top of App.tsx).
// Safe to call multiple times — PostHog ignores duplicate inits.

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) {
    console.warn("[analytics] VITE_POSTHOG_KEY is not set — tracking disabled.");
    return;
  }
  posthog.init(key, {
    api_host: "https://us.i.posthog.com",
    person_profiles: "always", // enable user profiles for PostHog surveys
    capture_pageview: false,            // SPA — we'll track screens manually if needed
  });
}

// ---------------------------------------------------------------------------
// Typed event catalogue
// ---------------------------------------------------------------------------
// Every event name and its expected properties are defined here.
// If you rename an event or add a property, change it in ONE place.

type EventMap = {
  // ── Onboarding ────────────────────────────────────────────────────────
  session_started: Record<string, never>;

  // ── Playlist building ─────────────────────────────────────────────────
  game_added_to_playlist: {
    game_name: string;
    bgg_id?: string;
    weight: "light" | "heavy";
    source: "search" | "hot_list";
  };
  game_removed_from_playlist: {
    game_name: string;
    weight: "light" | "heavy";
  };

  // ── Session ───────────────────────────────────────────────────────────
  session_begun: {
    playlist_size: number;
    weight_preference: "light" | "heavy";
    is_sorted: boolean;
  };
  game_suggested: {
    game_name: string;
    weight: "light" | "heavy";
    games_remaining: number;
  };
  game_confirmed: {
    game_name: string;
    weight: "light" | "heavy";
    playing_time?: number;
    games_played_so_far: number;
  };
  game_skipped: {
    game_name: string;
    weight: "light" | "heavy";
  };
  game_removed: {
    game_name: string;
    weight: "light" | "heavy";
  };
  game_overridden: {
    selected_game_name: string;
    overridden_game_name: string;
  };
  weight_preference_changed: {
    new_preference: "light" | "heavy";
  };

  // ── Menu ──────────────────────────────────────────────────────────────
  menu_opened: Record<string, never>;
  menu_closed: {
    action: "dismissed"; // closed without choosing an option
  };
  menu_view_playlist_tapped: Record<string, never>;
  menu_main_menu_tapped: Record<string, never>;
  menu_main_menu_cancelled: Record<string, never>;

  // ── End of session ────────────────────────────────────────────────────
  session_finished: {
    games_played: number;
    original_playlist_size: number;
  };
  // User completed the playlist and chose to play again from FinishedScreen
  session_restarted: Record<string, never>;
  // User quit early via the menu before finishing the playlist
  session_abandoned: {
    screen_at_abandon: string;
    games_played_so_far: number;
  };
  // User intentionally ended the night early via the override bottom sheet
  session_ended_early: {
    games_played: number;
    games_remaining: number;
    original_playlist_size: number;
  };
};

// ---------------------------------------------------------------------------
// track() — the single function you call everywhere else
// ---------------------------------------------------------------------------
// TypeScript will error if you pass an event name that isn't in EventMap,
// or if the properties don't match what's expected.

export function track<E extends keyof EventMap>(
  event: E,
  ...args: EventMap[E] extends Record<string, never>
    ? []                    // no properties needed — call as track("session_started")
    : [properties: EventMap[E]]
) {
  const properties = args[0] ?? {};
  posthog.capture(event, properties);
}

// ---------------------------------------------------------------------------
// Small helper — builds the common game property block from a Game object
// so call sites don't have to destructure manually every time.
// ---------------------------------------------------------------------------
export function gameProps(game: Game) {
  return {
    game_name: game.name,
    weight: game.weight,
    ...(game.bggId && { bgg_id: game.bggId }),
    ...(game.playingTime && { playing_time: game.playingTime }),
  };
}