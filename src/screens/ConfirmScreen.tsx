import type { Game } from "../domain/types";

type Props = {
  onNext: () => void;
  onRestart: () => void;
};

export default function ConfirmScreen({ onNext, onRestart }: Props) {
  return (
    <>
      <h2>Confirm</h2>
      <p>Veto or confirm.</p>
      <button onClick={onNext}>Veto</button>
      <button onClick={onRestart}>Continue</button>
    </>
  );
}