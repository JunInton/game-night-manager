type Props = {
  game: Game;
  onNext: () => void;
};

type Game = {
  name: string;
  weight: "light" | "heavy";
}

export default function SuggestionScreen({ game, onNext }: Props) {
  return (
    <>
      <h2>Suggestions</h2>
      <p>Here are some suggestions for the next game.</p>
      <p>You should play:</p>
      <h3>{game.name}</h3>
      <button onClick={onNext}>Continue</button>
    </>
  );
}