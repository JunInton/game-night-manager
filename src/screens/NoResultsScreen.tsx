type Props = {
  onRestart: () => void;
};

export default function NoResultsScreen({ onRestart }: Props) {
  return (
    <>
      <h2>No more games left</h2>
      <p>
        No more appropriate games to choose.
      </p>
      <button onClick={onRestart}>Start over</button>
    </>
  );
}
