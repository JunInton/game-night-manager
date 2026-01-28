import { useListBox } from "react-aria";
import { useListState, Item } from "react-stately";
import { useRef } from "react";
import type { Game } from "../domain/types";
import { Option } from "./Option";

type Props = {
  games: Game[];
  onSelect: (game: Game) => void;
};

export function GameSearchResults({ games, onSelect }: Props) {
  const ref = useRef<HTMLUListElement>(null);

  const state = useListState<Game>({
    selectionMode: "single",
    children: games.map((game) => (
      <Item key={game.name} textValue={game.name} >
        {game.name}
      </Item>
    )),
  });

  const { listBoxProps } = useListBox(
    {
      "aria-label": "Search results",
      onAction: (key) => {
        console.log("Action on key:", key);
        const game = games.find((g) => g.name === key);
        console.log("Found game:", game);
        if (game) onSelect(game);
      }
    },
    state,
    ref
  );

  return (
    <ul
      {...listBoxProps}
      ref={ref}
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        marginTop: 8,
        padding: 0,
        listStyle: "none",
      }}
    >
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </ul>
  );
}