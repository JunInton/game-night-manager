import { useState, useEffect } from "react";
import SetupScreen from "./screens/SetupScreen";
import SuggestionScreen from "./screens/SuggestionScreen";
import ConfirmScreen from "./screens/ConfirmScreen";
import suggestNextGame from "./domain/suggestNextGame";
import NoResultsScreen from "./screens/NoResultsScreen";
import type { Game } from "./domain/types";
import "./App.css";

type Screen = "setup" | "suggestion" | "confirm";

type SessionState = {
  games: Game[];
  lastPlayed?: Game;
  vetoedGames: Game[];
  overriddenGame?: Game;
}

// Key for sessionStorage
const SESSION_KEY = "gameNightSession";

function App() {
  // Load screen state from sessionStorage (defaults to "setup")
  const [screen, setScreen] = useState<Screen>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If there are games in the session, go to suggestion screen
        if (parsed.session?.games?.length > 0) {
          return "suggestion";
        }
      } catch (e) {
        console.error("Failed to parse saved session:", e);
      }
    }
    return "setup";
  });

  // Load session state from sessionStorage
  const [session, setSession] = useState<SessionState>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.session || {
          games: [],
          vetoedGames: [],
        };
      } catch (e) {
        console.error("Failed to parse saved session:", e);
        return {
          games: [],
          vetoedGames: [],
        };
      }
    }
    return {
      games: [],
      vetoedGames: [],
    };
  });

  // Load weight preference from sessionStorage
  const [weightPreference, setWeightPreference] = useState<"light" | "heavy" | null>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.weightPreference || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  // Save to sessionStorage whenever any state changes
  useEffect(() => {
    const dataToSave = {
      session,
      weightPreference,
      screen,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(dataToSave));
  }, [session, weightPreference, screen]);

  // Calculate next game whenever session changes and we're on the suggestion screen
  useEffect(() => {
    if (screen === "suggestion") {
      // Use overridden game if it exists, otherwise suggest normally
      if (session.overriddenGame) {
        setCurrentGame(session.overriddenGame);
      } else {
        const nextGame = suggestNextGame(session.games, session.lastPlayed, weightPreference);
        setCurrentGame(nextGame);
      }
    }
  }, [screen, session.games, session.lastPlayed, session.overriddenGame ]);

  // Handle override selection
  const handleOverride = (selectedGame: Game) => {
    setSession({
      ...session,
      overriddenGame: selectedGame,
    });
  };

  // Handle restart - clears sessionStorage
  const handleRestart = () => {
    setSession({ games: [], vetoedGames: [] });
    setWeightPreference(null);
    setScreen("setup");
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <div className="app-root">
      <div className="app-frame">
        <div>
          {screen === "setup" && (
            <SetupScreen 
            onNext={(games) => {
              setSession({ games, vetoedGames: [] });
              setScreen("suggestion");
            }} />
          )}

          {screen === "suggestion" && (
            currentGame ? (
              <SuggestionScreen 
              game={currentGame}
              allGames={session.games}
              nextWeight={weightPreference}
              onConfirm={() => {
                setSession({
                  games: session.games.filter((g) => g.name !== currentGame.name),
                  lastPlayed: currentGame,
                  vetoedGames: session.vetoedGames,
                  overriddenGame: undefined,
                });
                setScreen("confirm");
              }}
              onVeto={() => {
                setSession({
                  ...session,
                  games: session.games.filter(
                    (g) => g.name !== currentGame.name
                  ),
                  vetoedGames: [...session.vetoedGames, currentGame],
                  overriddenGame: undefined,
                });
              }}
              onWeightPreferenceChange={(weight) => setWeightPreference(weight)}
              onOverride={handleOverride}
              />
            ) : (
              <NoResultsScreen
                vetoedGames={session.vetoedGames}
                onRestart={handleRestart}
                onReplayVetoed={() => {
                  setSession({
                    games: session.vetoedGames,
                    vetoedGames: [],
                    lastPlayed: undefined,
                  });
                  setWeightPreference(null);
                  setScreen("suggestion");
                }}
              />
            )
          )}

          {screen === "confirm" && currentGame && (
            <ConfirmScreen 
            game={currentGame}
            onNext={() => {
              setScreen("suggestion");
            }}
            onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App;