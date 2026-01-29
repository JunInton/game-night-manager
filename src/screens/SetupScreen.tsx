import { useState } from "react";
import type { Game } from "../domain/types";
import { GameSearchInput } from "../components/GameSearchInput";
import { GameSearchResults } from "../components/GameSearchResults";
import "./SetupScreen.css";

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
  { name: "Azul", weight: "heavy" },
  { name: "Codenames", weight: "light" },
  { name: "Wingspan", weight: "heavy" },
  { name: "Pandemic", weight: "heavy" },
  { name: "Sushi Go!", weight: "light" },
  { name: "Ticket to Ride", weight: "light" },
  { name: "Carcassonne", weight: "light" },
  { name: "7 Wonders", weight: "heavy" },
  { name: "Dominion", weight: "heavy" },
  { name: "Splendor", weight: "light" },
  { name: "Betrayal at House on the Hill", weight: "heavy" },
  { name: "Castle Panic", weight: "light" },
  { name: "Dixit", weight: "light" },
  { name: "Everdell", weight: "heavy" },
  { name: "Flamecraft", weight: "light" },
  { name: "Hanabi", weight: "light" },
  { name: "Kingdomino", weight: "light" },
  { name: "Mysterium", weight: "heavy" },
  { name: "Photosynthesis", weight: "heavy" },
  { name: "Namiji", weight: "light" },
  { name: "Pandante", weight: "light" },
  { name: "Quacks of Quedlinburg", weight: "heavy" },
  { name: "Set a Watch", weight: "light" },
  { name: "Space Base", weight: "light" },
  { name: "Tiny Epic Galaxies", weight: "light" },
  { name: "Roll for the Galaxy", weight: "heavy" },
  { name: "Tsuro", weight: "light" },
  { name: "Zombicide", weight: "heavy" },
];

export default function SetupScreen({ onNext }: Props) {

  const [search, setSearch] = useState("");
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);

  const filteredGames = demoGames.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase()) &&
    !selectedGames.some((selected) => selected.name === game.name)
  );

  const displayGames = search ? filteredGames : demoGames.filter(
    (game) => !selectedGames.some((selected) => selected.name === game.name)
  );

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <button className="close-button">x</button>
        <h1 className="setup-title">Board Game Playlist</h1>
      </div>

      <div className="search-container">
        <GameSearchInput value={search} onChange={setSearch} />
      </div>

      <div className="games-section">
        <h2 className="section-title">
          {search ? "Search Results" : "Most popular games"}
        </h2>

        {displayGames.length > 0 ? (
          <GameSearchResults
            games={displayGames}
            onSelect={(game) => {
              setSelectedGames([...selectedGames, game]);
              setSearch("");
            }}
          />
        ) : (
          <p className="no-results"> No games found</p>
        )}
      </div>

      {selectedGames.length > 0 && (
        <div className="selected-count">
          {selectedGames.length} game{selectedGames.length !== 1 ? 's' : ''} selected
        </div>
      )}

      <button
        className="create-button"
        onClick={() => onNext(selectedGames)}
        disabled={selectedGames.length === 0}
      >
        Create your game night list
      </button>
    </div>
  )
}

  // return (
  //   <>
  //     <h2>Setup</h2>
  //     <p>Enter games and session constraints.</p>

  //     <GameSearchInput value={search} onChange={setSearch} />

  //     {search && filteredGames.length > 0 && (
  //       <GameSearchResults
  //         games={filteredGames}
  //         onSelect={(game) => {
  //           setSelectedGames([...selectedGames, game]);
  //           setSearch("");
  //         }}
  //       />
  //     )}

  //     {selectedGames.length > 0 && (
  //       <>
  //         <h3>Selected games</h3>
  //         <ul>
  //           {selectedGames.map((game) => (
  //             <li key={game.name}>
  //               {game.name} ({game.weight})
  //             </li>
  //           ))}
  //         </ul>

  //         <button onClick={() => onNext(selectedGames)}>Use selected games</button>
  //       </>
  //     )}

  //   </>
  // )