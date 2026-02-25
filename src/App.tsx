import { useState, useEffect } from "react";
import StartScreen from "./screens/StartScreen";
import CreateListScreen from "./screens/CreateListScreen";
import PlaylistScreen from "./screens/PlaylistScreen";
import SuggestionScreen from "./screens/SuggestionScreen";
import ConfirmScreen from "./screens/ConfirmScreen";
import NoResultsScreen from "./screens/NoResultsScreen";
import suggestNextGame from "./domain/suggestNextGame";
import type { Game } from "./domain/types";
import "./App.css";

type Screen = "start" | "create_list" | "playlist" | "suggestion" | "confirm";

type SessionState = {
  games: Game[];
  playlistGames: Game[];
  lastPlayed?: Game;
  vetoedGames: Game[];
  overriddenGame?: Game;
};

const SESSION_KEY = "gameNightSession";

function defaultSession(): SessionState {
  return { games: [], playlistGames: [], vetoedGames: [] };
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
      if (saved) return JSON.parse(saved).session ?? defaultSession();
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

  // Persist state
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session, weightPreference, screen }));
  }, [session, weightPreference, screen]);

  useEffect(() => {
    if (screen !== "suggestion") return;
    setCurrentGame(
      session.overriddenGame
        ?? suggestNextGame(session.games, session.lastPlayed, weightPreference)
    );
  }, [screen, session.games, session.lastPlayed, session.overriddenGame, weightPreference]);

  const handleRestart = () => {
    setSession(defaultSession());
    setWeightPreference("light");
    setDraftGames([]);
    setScreen("start");
    sessionStorage.removeItem(SESSION_KEY);
  };

  const handlePlaylistGamesChange = (updated: Game[]) => {
    setSession(prev => ({ ...prev, playlistGames: updated, games: updated }));
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
              setSession({ games: draftGames, playlistGames: draftGames, vetoedGames: [] });
              setScreen("playlist");
            }}
          />
        )}

        {screen === "playlist" && (
          <PlaylistScreen
            games={session.playlistGames}
            weightPreference={weightPreference}
            onGamesChange={handlePlaylistGamesChange}
            onWeightPreferenceChange={setWeightPreference}
            onAddGame={() => {
              setDraftGames(session.playlistGames);
              setScreen("create_list");
            }}
            onReady={() => {
              setSession(prev => ({
                ...prev,
                games: prev.playlistGames,
                vetoedGames: [],
                lastPlayed: undefined,
                overriddenGame: undefined,
              }));
              setScreen("suggestion");
            }}
          />
        )}

        {screen === "suggestion" && (
          currentGame ? (
            <SuggestionScreen
              game={currentGame}
              allGames={session.games}
              nextWeight={weightPreference}
              onConfirm={() => {
                setSession(prev => ({
                  ...prev,
                  games: prev.games.filter(g => g.name !== currentGame.name),
                  lastPlayed: currentGame,
                  overriddenGame: undefined,
                }));
                setScreen("confirm");
              }}
              onVeto={() => {
                setSession(prev => ({
                  ...prev,
                  games: prev.games.filter(g => g.name !== currentGame.name),
                  vetoedGames: [...prev.vetoedGames, currentGame],
                  overriddenGame: undefined,
                }));
              }}
              onWeightPreferenceChange={setWeightPreference}
              onOverride={(selected) => {
                setSession(prev => ({ ...prev, overriddenGame: selected }));
              }}
            />
          ) : (
            <NoResultsScreen
              vetoedGames={session.vetoedGames}
              onRestart={handleRestart}
              onReplayVetoed={() => {
                setSession(prev => ({
                  games: prev.vetoedGames,
                  playlistGames: prev.vetoedGames,
                  vetoedGames: [],
                  lastPlayed: undefined,
                }));
                setWeightPreference("light");
                setScreen("suggestion");
              }}
            />
          )
        )}

        {screen === "confirm" && currentGame && (
          <ConfirmScreen
            game={currentGame}
            onNext={() => setScreen("suggestion")}
            onRestart={handleRestart}
          />
        )}

      </div>
    </div>
  );
}

export default App;