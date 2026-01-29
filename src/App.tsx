import { useState } from "react";
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
}

function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [session, setSession] = useState<SessionState>({
    games: [],
  });

  const nextGame = suggestNextGame(
    session.games,
    session.lastPlayed
  );

  return (
    <div className="app-root">
      <div className="app-frame">
        <div className="app-header">
          <h1>Game Night Manager</h1>
        </div>
        <div>
          {screen === "setup" && (
            <SetupScreen 
            onNext={(games) => {
              setSession({ games });
              setScreen("suggestion");
            }} />
          )}

          {/* {screen === "suggestion" && nextGame && (
            <SuggestionScreen 
              game={nextGame}
              onNext={() => setScreen("confirm")} />
          )} */}

          {screen === "suggestion" && (
            nextGame ? (
              <SuggestionScreen 
              game={nextGame}
              onNext={() => setScreen("confirm")}
              />
            ) : (
              <NoResultsScreen
                onRestart={() => {
                  setSession({ games: [] });
                  setScreen("setup");
                }}
              />
            )
          )}

          {screen === "confirm" && nextGame && (
            <ConfirmScreen 
            game={nextGame}
            onConfirm={() => {
              setSession({
                games: session.games.filter((g) => g.name !== nextGame.name),
                lastPlayed: nextGame,
              });
              setScreen("suggestion");
            }}
            onVeto={() => {
              setSession({
                ...session,
                games: session.games.filter(
                  (g) => g.name !== nextGame.name
                ),
              });
              setScreen("suggestion");
            }}
            onRestart={() => {
              setSession({ games: [] });
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