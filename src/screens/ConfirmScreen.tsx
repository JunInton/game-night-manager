import type { Game } from "../domain/types";

type Props = {
  game: Game;
  onConfirm: () => void;
  onVeto: () => void;
  onRestart: () => void;
};

export default function ConfirmScreen({ game, onConfirm, onVeto, onRestart }: Props) {
  return (
    <>
      <h2>Confirm</h2>
      <p>Do you want to play:</p>
      <h3>{game.name}</h3>
      <p>Weight: {game.weight}</p>
      <button onClick={onVeto}>Veto</button>
      <button onClick={onConfirm}>Play this</button>
      <button onClick={onRestart}>Restart</button>
    </>
  );
}