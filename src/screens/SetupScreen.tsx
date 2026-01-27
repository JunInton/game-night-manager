import { useState } from "react";
import type { Game } from "../domain/types";
import { GameSearchInput } from "../components/GameSearchInput";

type Props = {
  onNext: (games: Game[]) => void;
};

const demoGames: Game[] = [
  { name: "Roll For It", weight: "light" },
  { name: "Gloomhaven", weight: "heavy" },
  { name: "Spirit Island", weight: "heavy" },
  { name: "Qwixx", weight: "light" },
  { name: "Camel Up", weight: "heavy" },
  { name: "Veiled Fate", weight: "heavy" },
  { name: "Incan Gold", weight: "light" },
  { name: "Flip 7", weight: "light" },
];



export default function SetupScreen({ onNext }: Props) {

  const [search, setSearch] = useState("");

  const filteredGames = demoGames.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <>
      <h2>Setup</h2>
      <p>Enter games and session constraints.</p>

      <GameSearchInput value={search} onChange={setSearch} />

      {/* <button onClick={() => onNext(demoGames)}>Use sample games</button> */}

      <table style={{ margin: "16px auto", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Game</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {filteredGames.map((game) => (
            <tr key={game.name}>
              <td>{game.name}</td>
              <td>{game.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => onNext(filteredGames)}>Use selected games</button>
    </>
  );
}