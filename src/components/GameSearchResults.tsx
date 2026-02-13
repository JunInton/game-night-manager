import { useListBox } from "react-aria";
import { useListState, Item } from "react-stately";
import { useRef } from "react";
import Box from '@mui/material/Box';
import type { Game } from "../domain/types";
import { Option } from "./Option";

type Props = {
  games: Game[];
  onSelect: (game: Game) => void;
};

export function GameSearchResults({ games, onSelect }: Props) {
  const ref = useRef<HTMLUListElement>(null);

  const state = useListState<Game>({
    selectionMode: "single" as const,
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
        const game = games.find((g) => g.name === key);
        if (game) onSelect(game);
      }
    },
    state,
    ref
  );

  return (
    <Box
      {...listBoxProps}
      ref={ref}
      component="ul"
      sx={{ 
        listStyle: 'none',
        p: 0,
        m: 0,
      }}
    >
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} games={games} onSelect={onSelect} />
      ))}
    </Box>
  );
}