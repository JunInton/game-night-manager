import { useState } from "react";
import type { Game } from "../domain/types";
import { GameSearchInput } from "../components/GameSearchInput";
import { GameSearchResults } from "../components/GameSearchResults";

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
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);

  const filteredGames = demoGames.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase()) &&
    !selectedGames.some((selected) => selected.name === game.name)
  );


  return (
    <>
      <h2>Setup</h2>
      <p>Enter games and session constraints.</p>

      <GameSearchInput value={search} onChange={setSearch} />

      {search && filteredGames.length > 0 && (
        <GameSearchResults
          games={filteredGames}
          onSelect={(game) => {
            setSelectedGames([...selectedGames, game]);
            setSearch("");
          }}
        />
      )}

      {selectedGames.length > 0 && (
        <>
          <h3>Selected games</h3>
          <ul>
            {selectedGames.map((game) => (
              <li key={game.name}>
                {game.name} ({game.weight})
              </li>
            ))}
          </ul>

          <button onClick={() => onNext(selectedGames)}>Use selected games</button>
        </>
      )}

    </>
  );
}