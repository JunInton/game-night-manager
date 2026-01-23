import type { Game } from "../domain/types";

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
  return (
    <>
      <h2>Setup</h2>
      <p>Enter games and session constraints.</p>

      <button onClick={() => onNext(demoGames)}>Use sample games</button>
      {/* <button onClick={onNext}>Continue</button> */}

      <table style={{ margin: "16px auto", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px 12px", borderBottom: "1px solid #ccc" }}>
              Game
            </th>
            <th style={{ padding: "8px 12px", borderBottom: "1px solid #ccc" }}>
              Weight
            </th>
          </tr>
        </thead>
        <tbody>
          {demoGames.map((game) => (
            <tr key={game.name}>
              <td style={{ padding: "6px 12px" }}>{game.name}</td>
              <td style={{ padding: "6px 12px" }}>{game.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}