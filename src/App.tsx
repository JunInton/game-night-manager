import { useState } from "react";
import SetupScreen from "./screens/SetupScreen";
import SuggestionScreen from "./screens/SuggestionScreen";
import ConfirmScreen from "./screens/ConfirmScreen";

type Screen = "setup" | "suggestion" | "confirm";

type Game = {
  name: string;
  weight: "light" | "heavy";
}

type SessionState = {
  games: Game[];
  lastPlayed: Game;
}

function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [session, setSession] = useState<SessionState>({
    games: [],
  });

  return (
    <>
      <div style={{ padding: 24 }}>
        <h1>Game Night Sequencer</h1>
      </div>
      <div>
        {screen === "setup" && (
          <SetupScreen onNext={() => setScreen("suggestion")} />
        )}

        {screen === "suggestion" && (
          <SuggestionScreen onNext={() => setScreen("confirm")} />
        )}

        {screen === "confirm" && (
          <ConfirmScreen onNext={() => setScreen("suggestion")} onRestart={() => setScreen("setup")} />
        )}
      </div>
    </>
  )
}

export default App;