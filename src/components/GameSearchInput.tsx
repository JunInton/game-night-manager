import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import type { Game } from '../domain/types';

// ─── Props ────────────────────────────────────────────────────────────────────
// Not all props are used by this component directly — games, onSelect, and
// renderResults were originally used by the Popper dropdown (see commented-out
// code below) and are kept in the type in case that pattern is revived.
// Today only value and onChange are actually read by GameSearchInput.
type Props = {
  value: string;
  onChange: (value: string) => void;
  games: Game[];
  onSelect: (game: Game) => void;
  renderResults: (games: Game[]) => React.ReactNode;
};

// NOTE: The inline dropdown (Popper) approach was replaced by rendering the
// results list directly below the search field in CreateListScreen. The
// commented-out block below is the old implementation.

// async function searchBGG(query: string) {
//   try {
//     const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
//     …
// }

// ─── GameSearchInput ──────────────────────────────────────────────────────────
// A single controlled text field with a search icon adornment on the right.
// The parent (CreateListScreen) owns the search value in state and passes it
// down via value/onChange — this component is purely presentational.
export function GameSearchInput({ value, onChange }: Props) {
  return (
    // Relative positioning is a remnant of the Popper dropdown, which needed
    // the field as its anchor element. Harmless to keep.
    <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          placeholder="Search games"
          value={value}
          // e.target.value is the current text in the input.
          // We pass it up to the parent so it can trigger the search debounce.
          onChange={(e) => onChange(e.target.value)}
          InputProps={{
            endAdornment: (
              // InputAdornment places the icon inside the text field's border,
              // right-aligned (position="end").
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              // Subtle frosted glass background — slightly lighter than the page.
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '28px',
              // The old Popper dropdown would square off the bottom corners when
              // the dropdown was open. That logic is commented out here because
              // results are now shown inline below, not in a floating Popper.
              // borderBottomLeftRadius: open && value.length > 0 ? 0 : undefined,
              // borderBottomRightRadius: open && value.length > 0 ? 0 : undefined,
              '& fieldset': {
                // Remove the visible border — the shape and background are enough.
                border: 'none',
              },
            }
          }}
        />

        {/* ── Old inline Popper dropdown (replaced by inline list in CreateListScreen) ──
            Left here for reference. The Popper would anchor below the text field
            and show search results in a floating Paper overlay.
        <Popper
          open={open && value.length > 0}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300 }}
        >
          <Box sx={{ width: anchorRef.current?.offsetWidth || 'auto' }}>
            <Paper elevation={8} sx={{ maxHeight: '60vh', overflow: 'auto', … }}>
              <Box sx={{ p: 2 }}>
                {games.length > 0 ? (
                  renderResults(games)
                ) : (
                  <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                    No games found test
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Popper>
        */}
      </Box>
  );
}