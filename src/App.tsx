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
import "./App.css";

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

function defaultSession(): SessionState {
  return { games: [], playlistGames: [], playedGames: [], isSorted: false };
}

function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const { session } = JSON.parse(saved);
        if (session?.playlistGames?.length > 0) return "playlist";
      }
    } catch { /* ignore */ }
    return "start";
  });

  const [session, setSession] = useState<SessionState>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved).session ?? defaultSession();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { vetoedGames: _v, ...clean } = parsed;
        return clean as SessionState;
      }
    } catch { /* ignore */ }
    return defaultSession();
  });

  const [weightPreference, setWeightPreference] = useState<"light" | "heavy">(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const pref = JSON.parse(saved).weightPreference;
        if (pref === "light" || pref === "heavy") return pref;
      }
    } catch { /* ignore */ }
    return "light";
  });

  const [draftGames, setDraftGames] = useState<Game[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved).session?.playlistGames ?? [];
    } catch { /* ignore */ }
    return [];
  });

  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  // Tracks whether the user navigated to PlaylistScreen mid-session via the menu
  const [isResumingPlaylist, setIsResumingPlaylist] = useState(false);

  // Persist state
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session, weightPreference, screen }));
  }, [session, weightPreference, screen]);

  const handleRestart = () => {
    setSession(defaultSession());
    setWeightPreference("light");
    setDraftGames([]);
    setCurrentGame(null);
    setIsResumingPlaylist(false);
    setScreen("start");
    sessionStorage.removeItem(SESSION_KEY);
  };

  // True once the session has begun (user has moved past PlaylistScreen)
  // const sessionActive = screen === "suggestion" || screen === "confirm";

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
    setCurrentGame(next);
    setScreen("suggestion");
  };

  return (
    <div className="app-root">
      <div className="app-frame">

        {screen === "start" && (
          <StartScreen onStart={() => setScreen("create_list")} />
        )}

        {screen === "create_list" && (
          <CreateListScreen
            selectedGames={draftGames}
            onGamesChange={setDraftGames}
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
            onGamesChange={handlePlaylistGamesChange}
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
                    // Keep the live queue as-is, just clear any pending override
                    overriddenGame: undefined,
                  }
                : {
                    ...session,
                    games: session.playlistGames,
                    lastPlayed: undefined,
                    overriddenGame: undefined,
                };
              setSession(updatedSession);
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
                const updatedSession = {
                  ...session,
                  games: session.games.filter(g => g.name !== currentGame.name),
                  overriddenGame: undefined,
                };
                setSession(updatedSession);
                goToSuggestion(updatedSession, weightPreference);
              }}
              onWeightPreferenceChange={setWeightPreference}
              onOverride={(selected) => {
                const updatedSession = { ...session, overriddenGame: selected };
                setSession(updatedSession);
                goToSuggestion(updatedSession, weightPreference);
              }}
            />
          ) : (
            <FinishedScreen
              playlistGames={session.playedGames}
              onRestart={handleRestart}
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