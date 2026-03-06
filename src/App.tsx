import { useState, useEffect } from "react";
import StartScreen from "./screens/StartScreen";
import CreateListScreen from "./screens/CreateListScreen";
import PlaylistScreen from "./screens/PlaylistScreen";
import SuggestionScreen from "./screens/SuggestionScreen";
import ConfirmScreen from "./screens/ConfirmScreen";
import FinishedScreen from "./screens/FinishedScreen";
import suggestNextGame from "./domain/suggestNextGame";
import reinsertSkipped from "./domain/reinsertSkipped";
import type { Game } from "./domain/types";
import { initAnalytics, track } from "./analytics";

// Initialise PostHog once when the module loads.
// This is intentionally outside the component so it only runs once,
// regardless of React re-renders or Strict Mode double-invocations.
initAnalytics();

// ─── Screen names ────────────────────────────────────────────────────────────
// The app is a simple state machine with six screens.
// App.tsx holds the current screen name in state and renders the matching
// screen component. Navigating = setting this value.
type Screen = "start" | "create_list" | "playlist" | "suggestion" | "confirm" | "finished";

// ─── Session shape ───────────────────────────────────────────────────────────
// Everything that makes up one "game night" lives here and is persisted to
// localStorage so it survives tab closes and mobile browser suspension.
//
//   games         – the remaining pool that suggestNextGame draws from.
//                   Confirmed and removed games are filtered out of this list.
//   playlistGames – the original full list the user built; never shrinks during
//                   a session so PlaylistScreen and FinishedScreen can show it.
//   playedGames   – games the user confirmed/played (grows each round).
//   lastPlayed    – the most recently confirmed game; used by suggestNextGame to
//                   alternate weights (e.g. heavy → suggest light next).
//   overriddenGame– when the user manually picks a game from the sheet, it's
//                   stored here so goToSuggestion uses it instead of the algorithm.
//   isSorted      – true once the user has clicked the sort button on PlaylistScreen;
//                   tells suggestNextGame to respect playlist order rather than
//                   running its weight-alternating logic.
type SessionState = {
  games: Game[];
  playlistGames: Game[];
  playedGames: Game[];
  lastPlayed?: Game;
  overriddenGame?: Game;
  isSorted: boolean;
};

// ─── Persistence constants ───────────────────────────────────────────────────
const SESSION_KEY = "gameNightSession";
// Sessions older than 5 days are treated as stale and discarded on load.
const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

// Returns a blank session so we have a consistent starting point.
function defaultSession(): SessionState {
  return { games: [], playlistGames: [], playedGames: [], isSorted: false };
}

// Reads and validates the saved session from localStorage.
// Returns null if missing, unparseable, or older than SESSION_MAX_AGE_MS.
// The whole payload stored in localStorage is: { session, weightPreference, screen, savedAt }.
function loadSaved() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const age = Date.now() - (parsed.savedAt ?? 0);
    if (age > SESSION_MAX_AGE_MS) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    // JSON.parse can throw if the stored string is malformed — treat it as missing.
    return null;
  }
}

function App() {
  // ─── Screen state ─────────────────────────────────────────────────────────
  // The lazy initializer (arrow function passed to useState) only runs once on
  // mount. If there's a saved session with games, restore to "playlist" so the
  // user lands back where they left off rather than at the start screen.
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = loadSaved();
    if (saved?.session?.playlistGames?.length > 0) return "playlist";
    return "start";
  });

  // ─── Session state ────────────────────────────────────────────────────────
  // Also uses a lazy initializer to rehydrate from localStorage on first render.
  // We strip the old "vetoedGames" key here (a renamed/removed field) so stale
  // persisted data doesn't leak into the current SessionState shape.
  const [session, setSession] = useState<SessionState>(() => {
    const saved = loadSaved();
    if (saved?.session) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { vetoedGames: _v, ...clean } = saved.session;
      return clean as SessionState;
    }
    return defaultSession();
  });

  // ─── Weight preference ───────────────────────────────────────────────────
  // "light" means the algorithm starts with a light game and alternates.
  // "heavy" means it starts heavy. Defaults to "light" if not saved or invalid.
  const [weightPreference, setWeightPreference] = useState<"light" | "heavy">(() => {
    const saved = loadSaved();
    const pref = saved?.weightPreference;
    if (pref === "light" || pref === "heavy") return pref;
    return "light";
  });

  // ─── Draft games ──────────────────────────────────────────────────────────
  // Holds the list being built on CreateListScreen before the user navigates to
  // PlaylistScreen. Stored separately so edits on CreateListScreen don't
  // mutate session.playlistGames mid-session.
  const [draftGames, setDraftGames] = useState<Game[]>(() => {
    const saved = loadSaved();
    return saved?.session?.playlistGames ?? [];
  });

  // The game currently being shown on SuggestionScreen or ConfirmScreen.
  // null means the session is over — App renders FinishedScreen when
  // screen === "suggestion" && currentGame === null.
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  // Tracks whether the user navigated to PlaylistScreen mid-session via the menu.
  // When true, "Ready to game" on PlaylistScreen resumes rather than restarts the
  // session (it skips resetting lastPlayed and keeps played games intact).
  const [isResumingPlaylist, setIsResumingPlaylist] = useState(false);

  // ─── Persist state to localStorage ───────────────────────────────────────
  // Runs whenever session, weightPreference, or screen changes.
  // localStorage survives tab closes and mobile browser suspension (unlike
  // sessionStorage which is cleared when the tab closes).
  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      session,
      weightPreference,
      screen,
      savedAt: Date.now(),
    }));
  }, [session, weightPreference, screen]);

  // ─── Session finished analytics ──────────────────────────────────────────
  // Fire session_finished as soon as the finished state is reached
  // (screen = "suggestion" with no currentGame), regardless of what the user
  // does next (restart, close tab, etc.).
  useEffect(() => {
    if (screen === "suggestion" && !currentGame) {
      track("session_finished", {
        games_played: session.playedGames.length,
        original_playlist_size: session.playlistGames.length,
      });
    }
  }, [screen, currentGame, session.playedGames.length, session.playlistGames.length]);

  // ─── handleRestart ────────────────────────────────────────────────────────
  // Full reset — clears all state and wipes localStorage.
  // Fires session_abandoned if the user quits from an active screen
  // (not start or create_list). session_restarted is fired separately from
  // FinishedScreen so we can distinguish "quit early" vs "finished and restarted".
  const handleRestart = () => {
    const sessionWasActive = screen !== "start" && screen !== "create_list";
    if (sessionWasActive) {
      track("session_abandoned", {
        screen_at_abandon: screen,
        games_played_so_far: session.playedGames.length,
      });
    }

    setSession(defaultSession());
    setWeightPreference("light");
    setDraftGames([]);
    setCurrentGame(null);
    setIsResumingPlaylist(false);
    setScreen("start");
    localStorage.removeItem(SESSION_KEY);
  };

  // Updates both session.games (the live pool) and session.playlistGames
  // (the reference copy) when the user adds/removes games on PlaylistScreen.
  const handlePlaylistGamesChange = (updated: Game[]) => {
    setSession(prev => ({ ...prev, playlistGames: updated, games: updated }));
  };

  // Called by PlaylistScreen when the user clicks the sort/weight toggle.
  // Stores the new preference AND the newly sorted game order so suggestNextGame
  // respects the explicit ordering instead of randomising.
  const handleSort = (newPreference: "light" | "heavy", sortedGames: Game[]) => {
    setWeightPreference(newPreference);
    setSession(prev => ({
      ...prev,
      playlistGames: sortedGames,
      games: sortedGames,
      isSorted: true,
    }));
  };

  // ─── goToSuggestion ───────────────────────────────────────────────────────
  // Central navigation helper — determines the next game to show and moves to
  // the suggestion screen. All roads to SuggestionScreen go through here.
  //
  // Priority: if the session has an overriddenGame (user manually picked one
  // from the "Change game" sheet), use that. Otherwise run the algorithm.
  //
  // skippedGame is forwarded to suggestNextGame so the algorithm never
  // immediately re-suggests the game the user just skipped.
  const goToSuggestion = (
    updatedSession: SessionState,
    updatedPreference: "light" | "heavy",
    skippedGame?: Game,
  ) => {
    const next = updatedSession.overriddenGame
      ?? suggestNextGame(updatedSession.games, updatedSession.lastPlayed, updatedPreference, updatedSession.isSorted, skippedGame);

    if (next) {
      track("game_suggested", {
        game_name: next.name,
        weight: next.weight,
        games_remaining: updatedSession.games.length,
      });
    }

    setCurrentGame(next);
    setScreen("suggestion");
  };

  return (
    <div className="app-root">
      {/* app-frame constrains the layout to a phone-width column on wide screens */}
      <div className="app-frame">

        {/* ── Start screen ─────────────────────────────────────────────────── */}
        {screen === "start" && (
          <StartScreen
            onStart={() => {
              track("session_started");
              setScreen("create_list");
            }}
          />
        )}

        {/* ── Create list screen ───────────────────────────────────────────── */}
        {screen === "create_list" && (
          <CreateListScreen
            selectedGames={draftGames}
            onGamesChange={(updated) => {
              // Detect a newly added game by comparing list lengths.
              // The new game is always appended at the end.
              if (updated.length > draftGames.length) {
                const newGame = updated[updated.length - 1];
                track("game_added_to_playlist", {
                  game_name: newGame.name,
                  bgg_id: newGame.bggId,
                  weight: newGame.weight,
                  // CreateListScreen adds from both search and hot list;
                  // we default to "search" here — if you want to distinguish
                  // hot_list adds later, pass a source prop from that screen.
                  source: "search",
                });
              }
              setDraftGames(updated);
            }}
            onViewPlaylist={() => {
              // Commit the draft to the session before navigating away.
              setSession(prev => ({ ...prev, games: draftGames, playlistGames: draftGames }));
              setScreen("playlist");
            }}
          />
        )}

        {/* ── Playlist screen ──────────────────────────────────────────────── */}
        {screen === "playlist" && (
          <PlaylistScreen
            games={session.playlistGames}
            weightPreference={weightPreference}
            isSorted={session.isSorted}
            isResuming={isResumingPlaylist}
            onGamesChange={(updated) => {
              // Detect a removal (list got shorter) so we can track which game left.
              if (updated.length < session.playlistGames.length) {
                const removed = session.playlistGames.find(
                  g => !updated.some(u => u.name === g.name)
                );
                if (removed) {
                  track("game_removed_from_playlist", {
                    game_name: removed.name,
                    weight: removed.weight,
                  });
                }
              }
              handlePlaylistGamesChange(updated);
            }}
            onSort={handleSort}
            onAddGame={() => {
              // Sync draftGames with the current playlist so CreateListScreen
              // shows the right "already selected" state when the user returns.
              setDraftGames(session.playlistGames);
              setScreen("create_list");
            }}
            onReady={() => {
              setIsResumingPlaylist(false);

              // If the user is resuming mid-session (came here via the menu),
              // keep lastPlayed and playedGames intact — only clear the
              // overriddenGame flag so the algorithm runs fresh from here.
              // If this is a fresh start, also reset lastPlayed so the first
              // suggestion uses weightPreference directly.
              const updatedSession = isResumingPlaylist
                ? {
                    ...session,
                    overriddenGame: undefined,
                  }
                : {
                    ...session,
                    games: session.playlistGames,
                    lastPlayed: undefined,
                    overriddenGame: undefined,
                  };
              setSession(updatedSession);

              if (!isResumingPlaylist) {
                track("session_begun", {
                  playlist_size: session.playlistGames.length,
                  weight_preference: weightPreference,
                  is_sorted: session.isSorted,
                });
              }

              goToSuggestion(updatedSession, weightPreference);
            }}
            onMainMenu={handleRestart}
          />
        )}

        {/* ── Suggestion / Finished screen ─────────────────────────────────── */}
        {/* Both states share the "suggestion" screen name.
            When currentGame is null, the pool is exhausted → show FinishedScreen. */}
        {screen === "suggestion" && (
          currentGame ? (
            <SuggestionScreen
              game={currentGame}
              allGames={session.games}
              nextWeight={weightPreference}
              onMainMenu={handleRestart}
              onViewPlaylist={() => {
                setIsResumingPlaylist(true);
                setScreen("playlist");
              }}
              onConfirm={() => {
                // User agreed to play the suggested game.
                // Remove it from the pool, add to played history, move to ConfirmScreen.
                track("game_confirmed", {
                  game_name: currentGame.name,
                  weight: currentGame.weight,
                  playing_time: currentGame.playingTime,
                  games_played_so_far: session.playedGames.length + 1,
                });

                const updatedSession = {
                  ...session,
                  // Remove confirmed game from the remaining pool.
                  games: session.games.filter(g => g.name !== currentGame.name),
                  lastPlayed: currentGame,
                  playedGames: [...session.playedGames, currentGame],
                  overriddenGame: undefined,
                };
                setSession(updatedSession);
                setScreen("confirm");
              }}
              onSkip={() => {
                // User doesn't want to play this game right now.
                // reinsertSkipped puts it back at a random position later in the queue
                // so it will resurface but not immediately reappear.
                track("game_skipped", {
                  game_name: currentGame.name,
                  weight: currentGame.weight,
                });

                const skipped = currentGame;
                const updatedSession = {
                  ...session,
                  games: reinsertSkipped(session.games, skipped),
                  overriddenGame: undefined,
                };
                setSession(updatedSession);
                // Pass skippedGame so suggestNextGame won't suggest it again immediately.
                goToSuggestion(updatedSession, weightPreference, skipped);
              }}
              onRemove={() => {
                // User wants to permanently remove this game from tonight's session.
                track("game_removed", {
                  game_name: currentGame.name,
                  weight: currentGame.weight,
                });

                const updatedSession = {
                  ...session,
                  games: session.games.filter(g => g.name !== currentGame.name),
                  overriddenGame: undefined,
                };
                setSession(updatedSession);
                goToSuggestion(updatedSession, weightPreference);
              }}
              onWeightPreferenceChange={(newPref) => {
                // User toggled the weight toggle on SuggestionScreen.
                // We only update the preference here; the next call to
                // goToSuggestion will use the new value automatically.
                track("weight_preference_changed", {
                  new_preference: newPref,
                });
                setWeightPreference(newPref);
              }}
              onOverride={(selected) => {
                // User manually picked a different game from the bottom sheet.
                // Store it as overriddenGame so goToSuggestion uses it directly
                // instead of running the suggestion algorithm.
                track("game_overridden", {
                  selected_game_name: selected.name,
                  overridden_game_name: currentGame.name,
                });

                const updatedSession = { ...session, overriddenGame: selected };
                setSession(updatedSession);
                goToSuggestion(updatedSession, weightPreference);
              }}
              onEndNight={() => {
                // User wants to end the session early. Setting currentGame to null
                // with screen still "suggestion" triggers the FinishedScreen branch above.
                track("session_ended_early", {
                  games_played: session.playedGames.length,
                  games_remaining: session.games.length,
                  original_playlist_size: session.playlistGames.length,
                });
                setCurrentGame(null);
                setScreen("suggestion");
              }}
            />
          ) : (
            // Pool is exhausted (or user ended early) — show the summary screen.
            <FinishedScreen
              playlistGames={session.playedGames}
              onRestart={() => {
                track("session_restarted");
                handleRestart();
              }}
            />
          )
        )}

        {/* ── Confirm screen ───────────────────────────────────────────────── */}
        {/* Shown while the selected game is actually being played.
            currentGame is still set here (it hasn't been cleared yet). */}
        {screen === "confirm" && currentGame && (
          <ConfirmScreen
            game={currentGame}
            onMainMenu={handleRestart}
            onViewPlaylist={() => {
              setIsResumingPlaylist(true);
              setScreen("playlist");
            }}
            // When gameplay ends, go straight to the next suggestion.
            onNext={() => goToSuggestion(session, weightPreference)}
            onRestart={handleRestart}
          />
        )}

      </div>
    </div>
  );
}

export default App;