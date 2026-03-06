import { useRef } from "react";
import { useOption } from "react-aria";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import type { Game } from "../domain/types";
import type { Node } from "react-stately";
import type { ListState } from "react-stately";

// ─── Types ────────────────────────────────────────────────────────────────────
// item   – react-stately's internal node representation for this list entry.
//          item.key matches the game's name (set as the <Item key=...> in GameSearchResults).
// state  – the shared listbox state from GameSearchResults; Option needs it so
//          react-aria can sync focus/selection across all items in the list.
// games  – the full games array, needed to look up the complete Game object by name.
// onSelect – called when the user clicks (or keyboards) this option.
type OptionProps = {
  item: Node<Game>;
  state: ListState<Game>;
  games: Game[];
  onSelect: (game: Game) => void;
}

export function Option ({ item, state, games, onSelect }: OptionProps) {
  // ref is attached to the <li> element so react-aria can manage focus on it
  // (e.g. scrolling it into view when the user navigates with arrow keys).
  const ref = useRef<HTMLLIElement>(null);

  // useOption returns optionProps: the ARIA attributes and event handlers that
  // make this list item accessible (role="option", aria-selected, onPointerDown, etc.).
  // We spread these onto the Box below so they're applied to the actual DOM element.
  const { optionProps } = useOption(
    { key: item.key },
    state,
    ref
  );

  // item.key is the game name string — find the full Game object from the games array.
  // The ! non-null assertion is safe because item.key always corresponds to a game
  // that was just passed into GameSearchResults as the children list.
  const game = games.find((g) => g.name === item.key)!;

  return (
    // component="li" renders a semantic list item. Must be a child of a <ul>
    // (the Box component="ul" in GameSearchResults).
    // optionProps brings ARIA attributes; onClick handles the actual selection.
    <Box
      {...optionProps}
      ref={ref}
      component="li"
      onClick={() => onSelect(game)}
      sx={{
        mb: 1.5,
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        backgroundColor: 'transparent',
        border: '1px solid',
        borderColor: 'transparent',
        // Smooth colour transition on hover/focus instead of an instant flash.
        transition: 'all 0.2s',
        cursor: 'pointer',
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
      {/* ── Game thumbnail ─────────────────────────────────────────────────── */}
      {/* Show the actual cover art if we have it; otherwise show a gradient
          placeholder with the game's first letter as a stand-in. */}
      {game.imageUrl ? (
        <Box
          component="img"
          src={game.imageUrl}
          alt={game.name}
          sx={{
            width: 80,
            height: 80,
            objectFit: 'cover',  // crop to square without stretching
            borderRadius: 1,
            flexShrink: 0,       // don't let the image shrink when the row is narrow
          }}
        />
      ) : (
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
          {/* First letter of the game name as a placeholder monogram */}
          {game.name.charAt(0)}
        </Box>
      )}

      {/* ── Game name ─────────────────────────────────────────────────────── */}
      {/* flex: 1 makes this grow to fill available space.
          WebkitLineClamp + WebkitBoxOrient clamp the text to 2 lines max,
          adding an ellipsis if it overflows — prevents tall cards for long titles.
          minWidth: 0 is required for truncation to work inside a flex container. */}
      <Typography
        variant="body1"
        sx={{
          flex: 1,
          fontWeight: 500,
          color: 'text.primary',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
          minWidth: 0,
        }}
      >
        {game.name}
      </Typography>

      {/* ── Weight badge ─────────────────────────────────────────────────── */}
      {/* Small pill showing "light" or "heavy". flexShrink: 0 and whiteSpace: nowrap
          prevent it from squishing or wrapping — it always stays to the right of the name. */}
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          bgcolor: '#2B292F',    // dark.surfaceContainerHigh
          color: '#E6E0E9',      // dark.onSurface
          fontSize: '0.6875rem',
          fontWeight: 500,
          textTransform: 'capitalize',  // "light" → "Light", "heavy" → "Heavy"
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {game.weight}
      </Box>

      {/* ── Add icon ─────────────────────────────────────────────────────── */}
      {/* Visual affordance showing this row is tappable/clickable to add the game. */}
      <AddIcon
        sx={{
          color: 'text.primary',
          fontSize: 28,
          flexShrink: 0,
        }}
      />
    </Box>
  );
}


// ── Old ButtonBase-based implementation (replaced by the version above) ───────
// The previous approach wrapped everything in a MUI ButtonBase, which caused
// persistent focus ring issues after interaction. The current implementation
// uses a plain Box with react-aria's optionProps instead, which handles focus
// management correctly for accessible listbox items.
//
// Kept here for reference — safe to delete once you're confident the new approach
// is stable.

// import { useRef } from "react";
// import { useOption } from "react-aria";
// …
// export function Option ({ item, state, games, onSelect }: OptionProps) {
//   const ref = useRef<HTMLLIElement>(null);
//   const { optionProps } = useOption({ key: item.key }, state, ref);
//   const game = games.find((g) => g.name === item.key)!;
//
//   return (
//     <Box ref={ref} component="li" sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
//       <ButtonBase
//         {...optionProps}
//         disableRipple={false}
//         onBlur={() => {
//           // Force blur after interaction to prevent persistent focus
//           if (ref.current) { ref.current.blur(); }
//         }}
//         sx={{ width: '100%', … }}
//       >
//         …
//       </ButtonBase>
//     </Box>
//   );
// }