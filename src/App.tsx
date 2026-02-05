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
}

function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [session, setSession] = useState<SessionState>({
    games: [],
    vetoedGames: [],
  });
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [weightPreference, setWeightPreference] = useState<"light" | "heavy" | null>(null);

  // Calculate next game whenever session changes and we're on the suggestion screen
  useEffect(() => {
    if (screen === "suggestion") {
      const nextGame = suggestNextGame(session.games, session.lastPlayed, weightPreference);
      setCurrentGame(nextGame);
    }
  }, [screen, session.games, session.lastPlayed, weightPreference]);

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
              nextWeight={weightPreference}
              onConfirm={() => {
                setSession({
                  games: session.games.filter((g) => g.name !== currentGame.name),
                  lastPlayed: currentGame,
                  vetoedGames: session.vetoedGames,
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
                });
                // Stay on suggestion screen, useEffect will trigger new suggestion
              }}
              onWeightPreferenceChange={(weight) => setWeightPreference(weight)}
              />
            ) : (
              <NoResultsScreen
                vetoedGames={session.vetoedGames}
                onRestart={() => {
                  setSession({ games: [], vetoedGames: [] });
                  setWeightPreference(null);
                  setScreen("setup");
                }}
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
            onRestart={() => {
              setSession({ games: [], vetoedGames: [] });
              setWeightPreference(null);
              setScreen("setup");
            }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App;