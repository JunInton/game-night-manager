import { useListBox } from "react-aria";
import { useListState, Item } from "react-stately";
import { useRef } from "react";
import Box from '@mui/material/Box';
import type { Game } from "../domain/types";
import { Option } from "./Option";

// ─── Why react-aria + react-stately? ─────────────────────────────────────────
// react-aria provides fully accessible interaction hooks (keyboard nav, focus
// management, ARIA attributes) that plain MUI components don't cover for a
// listbox pattern. react-stately manages the selection/focus state that
// react-aria's hooks need to work. Together they handle:
//   • Arrow key navigation through results
//   • "Search results" announcement to screen readers
//   • Focus ring tracking (which item is currently highlighted)
//   • Triggering onAction when Enter/Space is pressed on an item

type Props = {
  games: Game[];
  onSelect: (game: Game) => void;
};

export function GameSearchResults({ games, onSelect }: Props) {
  // ref points at the <ul> element so react-aria can attach DOM event listeners.
  const ref = useRef<HTMLUListElement>(null);

  // useListState manages which item is focused/selected.
  // We use selectionMode "single" because the user picks one game at a time.
  // Each <Item> needs a unique key and a textValue for screen-reader announcements.
  const state = useListState<Game>({
    selectionMode: "single" as const,
    // Items are derived from the games prop — react-stately rebuilds this
    // collection whenever the games array changes (new search results).
    children: games.map((game) => (
      <Item key={game.name} textValue={game.name} >
        {game.name}
      </Item>
    )),
  });

  // useListBox wires up ARIA attributes and keyboard handlers to the <ul>.
  // listBoxProps must be spread onto the list element (see below).
  // onAction fires when the user activates an item (click or keyboard Enter/Space).
  const { listBoxProps } = useListBox(
    {
      "aria-label": "Search results",
      onAction: (key) => {
        // key corresponds to the game's name (set as the Item key above).
        const game = games.find((g) => g.name === key);
        if (game) onSelect(game);
      }
    },
    state,
    ref
  );

  return (
    // Spread listBoxProps first so our sx overrides take precedence.
    // component="ul" renders a semantic list element that <li> items (Option) can live in.
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
      {/* state.collection is react-stately's internal representation of the items list.
          We spread it into an array so we can use .map(). Each item's key matches
          the game name, which Option uses to look up the full Game object. */}
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} games={games} onSelect={onSelect} />
      ))}
    </Box>
  );
}