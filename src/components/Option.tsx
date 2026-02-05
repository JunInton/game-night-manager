import { useRef } from "react";
import { useOption } from "react-aria";
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
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
    <Box
      ref={ref}
      component="li"
      sx={{
        mb: 1.5,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <ButtonBase
        {...optionProps}
        disableRipple={false}
        onBlur={() => {
          // Force blur after interaction to prevent persistent focus
          if (ref.current) {
            ref.current.blur();
          }
        }}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          backgroundColor: 'transparent',
          border: '1px solid',
          borderColor: 'transparent',
          borderRadius: 2,
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(103, 80, 164, 0.15)',
            borderColor: 'primary.main',
          },
          '&:focus': {
            backgroundColor: 'rgba(103, 80, 164, 0.2)',
            borderColor: 'primary.main',
          },
          '&:active': {
            backgroundColor: 'rgba(103, 80, 164, 0.25)',
          }
        }}
      >
        {/* Rectangular thumbnail placeholder */}
        <Box
          sx={{
            width: 80,
            height: 80,
            flexShrink: 0,
            borderRadius: 1,
            background: 'linear-gradient(135deg, rgba(103, 80, 164, 0.3) 0%, rgba(103, 80, 164, 0.6) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: 'white',
          }}
        >
          {game.name.charAt(0)}
        </Box>

        {/* Game name */}
        <Typography 
          variant="body1" 
          sx={{ 
            flex: 1, 
            fontWeight: 500,
            color: 'text.primary',
            textAlign: 'left',
          }}
        >
          {game.name}
        </Typography>

        {/* Weight badge */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textTransform: 'capitalize',
            mr: 1,
          }}
        >
          {game.weight}
        </Typography>

        {/* Add button - no circle */}
        <IconButton 
          size="small"
          aria-label={`Add ${game.name}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the ButtonBase click
          }}
          sx={{
            color: 'text.primary',
            '&:hover': {
              color: 'primary.main',
            }
          }}
        >
          <AddIcon />
        </IconButton>
      </ButtonBase>
    </Box>
  );
}