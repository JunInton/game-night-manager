import { useRef } from "react";
import { useOption } from "react-aria";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Box from '@mui/material/Box';
import type { Game } from "../domain/types";
import type { Node } from "react-stately";
import type { ListState } from "react-stately";

type OptionProps = {
  item: Node<Game>;
  state: ListState<Game>;
  games: Game[];
}

export function Option ({ item, state, games }: OptionProps) {
  const ref = useRef<HTMLLIElement>(null);

  const { optionProps, isFocused } = useOption(
    { key: item.key },
    state,
    ref
  );

  const game = games.find((g) => g.name === item.key)!;

  return (
    <ListItem
      {...optionProps}
      ref={ref}
      disablePadding
      secondaryAction={
        <IconButton edge="end" aria-label={`Add ${game.name}`}>
          <AddCircleOutlineIcon />
        </IconButton>
      }
      sx={{
        border: isFocused ? 1 : 0,
        borderColor: 'primary.main',
        borderRadius: 1,
      }}
    >
      <ListItemButton>
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {game.name.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={game.name}
          secondary={
            <Chip 
              label={game.weight} 
              size="small" 
              sx={{ mt: 0.5 }}
            />
          }
        />
      </ListItemButton>
    </ListItem>
  );
}