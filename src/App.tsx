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
import "./App.css";

// Initialise PostHog once when the module loads.
// This is intentionally outside the component so it only runs once,
// regardless of React re-renders or Strict Mode double-invocations.
initAnalytics();

type Screen = "start" | "create_list" | "playlist" | "suggestion" | "confirm" | "finished";

type SessionState = {
  games: Game[];
  playlistGames: Game[];
  playedGames: Game[];
  lastPlayed?: Game;
  overriddenGame?: Game;
  isSorted: boolean;
};

const SESSION_KEY = "gameNightSession";
const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

function defaultSession(): SessionState {
  return { games: [], playlistGames: [], playedGames: [], isSorted: false };
}

// Reads and validates the saved session from localStorage.
// Returns null if missing, unparseable, or older than SESSION_MAX_AGE_MS.
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
    return null;
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = loadSaved();
    if (saved?.session?.playlistGames?.length > 0) return "playlist";
    return "start";
  });

  const [session, setSession] = useState<SessionState>(() => {
    const saved = loadSaved();
    if (saved?.session) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { vetoedGames: _v, ...clean } = saved.session;
      return clean as SessionState;
    }
    return defaultSession();
  });

  const [weightPreference, setWeightPreference] = useState<"light" | "heavy">(() => {
    const saved = loadSaved();
    const pref = saved?.weightPreference;
    if (pref === "light" || pref === "heavy") return pref;
    return "light";
  });

  const [draftGames, setDraftGames] = useState<Game[]>(() => {
    const saved = loadSaved();
    return saved?.session?.playlistGames ?? [];
  });

  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  // Tracks whether the user navigated to PlaylistScreen mid-session via the menu
  const [isResumingPlaylist, setIsResumingPlaylist] = useState(false);

  // Persist state — localStorage survives tab closes and mobile browser suspension
  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      session,
      weightPreference,
      screen,
      savedAt: Date.now(),
    }));
  }, [session, weightPreference, screen]);

  // Fire session_finished as soon as the finished state is reached,
  // regardless of what the user does next (restart, close tab, etc.)
  useEffect(() => {
    if (screen === "suggestion" && !currentGame) {
      track("session_finished", {
        games_played: session.playedGames.length,
        original_playlist_size: session.playlistGames.length,
      });
    }
  }, [screen, currentGame, session.playedGames.length, session.playlistGames.length]);

  const handleRestart = () => {
    // Only fire session_abandoned if the user quit mid-session.
    // session_restarted is fired separately from FinishedScreen.
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

  const handlePlaylistGamesChange = (updated: Game[]) => {
    setSession(prev => ({ ...prev, playlistGames: updated, games: updated }));
  };

  const handleSort = (newPreference: "light" | "heavy", sortedGames: Game[]) => {
    setWeightPreference(newPreference);
    setSession(prev => ({
      ...prev,
      playlistGames: sortedGames,
      games: sortedGames,
      isSorted: true,
    }));
  };

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
      <div className="app-frame">

        {screen === "start" && (
          <StartScreen
            onStart={() => {
              track("session_started");
              setScreen("create_list");
            }}
          />
        )}

        {screen === "create_list" && (
          <CreateListScreen
            selectedGames={draftGames}
            onGamesChange={(updated) => {
              // Detect newly added game by comparing lengths
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
              setSession(prev => ({ ...prev, games: draftGames, playlistGames: draftGames }));
              setScreen("playlist");
            }}
          />
        )}

        {screen === "playlist" && (
          <PlaylistScreen
            games={session.playlistGames}
            weightPreference={weightPreference}
            isSorted={session.isSorted}
            isResuming={isResumingPlaylist}
            onGamesChange={(updated) => {
              // Detect a removal (list got shorter) vs an addition
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
              setDraftGames(session.playlistGames);
              setScreen("create_list");
            }}
            onReady={() => {
              setIsResumingPlaylist(false);
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
                track("game_confirmed", {
                  game_name: currentGame.name,
                  weight: currentGame.weight,
                  playing_time: currentGame.playingTime,
                  games_played_so_far: session.playedGames.length + 1,
                });

                const updatedSession = {
                  ...session,
                  games: session.games.filter(g => g.name !== currentGame.name),
                  lastPlayed: currentGame,
                  playedGames: [...session.playedGames, currentGame],
                  overriddenGame: undefined,
                };
                setSession(updatedSession);
                setScreen("confirm");
              }}
              onSkip={() => {
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
                goToSuggestion(updatedSession, weightPreference, skipped);
              }}
              onRemove={() => {
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
                track("weight_preference_changed", {
                  new_preference: newPref,
                });
                setWeightPreference(newPref);
              }}
              onOverride={(selected) => {
                track("game_overridden", {
                  selected_game_name: selected.name,
                  overridden_game_name: currentGame.name,
                });

                const updatedSession = { ...session, overriddenGame: selected };
                setSession(updatedSession);
                goToSuggestion(updatedSession, weightPreference);
              }}
              onEndNight={() => {
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
            <FinishedScreen
              playlistGames={session.playedGames}
              onRestart={() => {
                track("session_restarted");
                handleRestart();
              }}
            />
          )
        )}

        {screen === "confirm" && currentGame && (
          <ConfirmScreen
            game={currentGame}
            onMainMenu={handleRestart}
            onViewPlaylist={() => {
              setIsResumingPlaylist(true);
              setScreen("playlist");
            }}
            onNext={() => goToSuggestion(session, weightPreference)}
            onRestart={handleRestart}
          />
        )}

      </div>
    </div>
  );
}

export default App;