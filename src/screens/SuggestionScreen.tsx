type Props = {
  onNext: () => void;
};

export default function SuggestionScreen({ onNext }: Props) {
  return (
    <>
      <h2>Suggestions</h2>
      <p>Here are some suggestions for the next game.</p>
      <button onClick={onNext}>Continue</button>
    </>
  );
}