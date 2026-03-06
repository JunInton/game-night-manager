import { useState } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Header } from "../components/Header";
import { PrimaryButton } from "../components/PrimaryButton";
import type { Game } from "../domain/types";

type Props = {
  games: Game[];
  weightPreference: "light" | "heavy";  // current sort direction
  isSorted: boolean;                     // true once the user has clicked the sort button
  onGamesChange: (games: Game[]) => void;
  onSort: (newPreference: "light" | "heavy", sortedGames: Game[]) => void;
  onAddGame: () => void;   // navigate back to CreateListScreen
  onReady: () => void;     // start (or resume) the session
  // True when the user navigates here mid-session via the hamburger menu.
  // Controls the CTA label ("Ready to game" vs "Resume Session") and
  // whether App.tsx resets lastPlayed when returning to suggestion mode.
  isResuming?: boolean;
  onMainMenu?: () => void;
};

// ─── PlaylistCover helpers ────────────────────────────────────────────────────
// Same tint array as FinishedScreen — four purple shades for placeholder cells.
const COVER_TINTS = [
  'rgba(103, 80, 164, 0.55)',
  'rgba(103, 80, 164, 0.35)',
  'rgba(103, 80, 164, 0.45)',
  'rgba(103, 80, 164, 0.25)',
];

// ─── Cell ─────────────────────────────────────────────────────────────────────
// Renders one of the four cells in the playlist cover collage.
// Prefers thumbnailUrl (small square crop) over imageUrl for performance.
// If neither exists, shows a coloured placeholder with the game's first letter.
function Cell({ game, idx }: { game?: Game; idx: number }) {
  return (game?.thumbnailUrl || game?.imageUrl) ? (
    <Box
      component="img"
      src={game.thumbnailUrl || game.imageUrl}
      alt={game.name}
      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  ) : (
    <Box sx={{
      width: '100%', height: '100%',
      bgcolor: game ? COVER_TINTS[idx % COVER_TINTS.length] : 'rgba(103,80,164,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
    }}>
      {game?.name.charAt(0) ?? ''}
    </Box>
  );
}

// ─── PlaylistCover ────────────────────────────────────────────────────────────
// A small 80×80 thumbnail that shows up to 4 game covers in a 2×2 grid.
// Similar to FinishedCollage but smaller, used inline in the playlist header row.
//
// Layout rules:
//   0 games → dice emoji centred
//   1 game  → single image spanning all 4 cells
//   2–4     → one game per cell
function PlaylistCover({ games }: { games: Game[] }) {
  const coverGames = games.slice(0, 4);

  return (
    <Box sx={{
      width: 80, height: 80,
      // borderRadius: 1 = 4px — minimal rounding matching the Figma design
      borderRadius: 1,
      overflow: 'hidden',
      flexShrink: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      bgcolor: 'rgba(103,80,164,0.15)',
    }}>
      {coverGames.length === 0 && (
        <Box sx={{
          gridColumn: '1/-1', gridRow: '1/-1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(207,189,254,0.3)', fontSize: 28,
        }}>
          🎲
        </Box>
      )}
      {coverGames.length === 1 && (
        <Box sx={{ gridColumn: '1/-1', gridRow: '1/-1', overflow: 'hidden' }}>
          <Cell game={coverGames[0]} idx={0} />
        </Box>
      )}
      {coverGames.length >= 2 && [0, 1, 2, 3].map(i => <Cell key={i} game={coverGames[i]} idx={i} />)}
    </Box>
  );
}

// ─── PlaylistScreen ───────────────────────────────────────────────────────────
export default function PlaylistScreen({
  games, weightPreference, isSorted, onGamesChange, onSort, onAddGame, onReady,
  isResuming = false, onMainMenu,
}: Props) {
  // Track the last removed game so the snackbar knows what name to show.
  const [lastRemovedGame, setLastRemovedGame] = useState<Game | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Sort snackbar — tells the user what order was applied.
  const [sortSnackbarOpen, setSortSnackbarOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState("");

  const handleRemove = (game: Game) => {
    // Filter by name (not index) so removals are stable even if the list re-orders.
    onGamesChange(games.filter(g => g.name !== game.name));
    setLastRemovedGame(game);
    setSnackbarOpen(true);
  };

  // Live date + time shown in the playlist header (e.g. "Mar 6 · 7:30PM").
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  // .replace(/\s/, '') removes the space between the time and AM/PM: "7:30 PM" → "7:30PM"
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s/, '');

  // ─── shuffle ───────────────────────────────────────────────────────────────
  // Fisher-Yates in-place shuffle. Works backwards from the last element,
  // swapping each element with a random element at or before its position.
  // This produces an unbiased uniform random permutation.
  // Note: mutates the input array and also returns it for convenience.
  const shuffle = <T,>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
      // Pick a random index j in [0, i] (inclusive on both ends).
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements at i and j using destructured assignment.
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // ─── sortGamesByWeight ─────────────────────────────────────────────────────
  // Interleaves light and heavy games starting with the preferred weight:
  //   e.g. firstWeight="light", 3 light + 2 heavy → [L, H, L, H, L]
  //
  // Each group is shuffled first so the order within each weight category is
  // random — clicking sort again produces a different arrangement.
  const sortGamesByWeight = (gamesToSort: Game[], firstWeight: "light" | "heavy"): Game[] => {
    const secondWeight = firstWeight === 'light' ? 'heavy' : 'light';
    // shuffle() mutates the array, so we pass a fresh filtered copy each time.
    const first = shuffle(gamesToSort.filter(g => g.weight === firstWeight));
    const second = shuffle(gamesToSort.filter(g => g.weight === secondWeight));
    const result: Game[] = [];
    // Zip the two arrays together: take one from first, one from second, repeat.
    // maxLen ensures we don't stop early if one group is longer.
    const maxLen = Math.max(first.length, second.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < first.length) result.push(first[i]);
      if (i < second.length) result.push(second[i]);
    }
    return result;
  };

  // ─── handleWeightToggle ────────────────────────────────────────────────────
  // Toggles between "Light > Heavy" and "Heavy > Light" sort orders.
  // Fires onSort with the new preference and a freshly sorted game array —
  // App.tsx stores both so suggestNextGame respects the sorted order.
  const handleWeightToggle = () => {
    const newPreference = weightPreference === 'light' ? 'heavy' : 'light';
    const sorted = sortGamesByWeight(games, newPreference);
    onSort(newPreference, sorted);
    const label = newPreference === 'light' ? 'Light > Heavy' : 'Heavy > Light';
    setSortLabel(label);
    setSortSnackbarOpen(true);
  };

  // Text label for the sort button — shows the current order.
  // Highlighted in lighter purple (CFBDFE) once sorted, brand purple (6750A4) before.
  const weightLabel = weightPreference === 'light' ? 'Light > Heavy' : 'Heavy > Light';

  return (
    // Full-height column: Header at top, scrollable game list in middle, fixed CTA at bottom.
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* Header has no onViewPlaylist — you're already on PlaylistScreen.
          onMainMenu lets the hamburger menu offer "Return to Main Menu". */}
      <Header onMainMenu={onMainMenu} />

      {/* ── Playlist header (collage + title + action row) ─────────────────── */}
      <Box sx={{ px: 2, pt: '16px', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PlaylistCover games={games} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* "Game playlist" in Roboto (not Road Rage) at 600 weight */}
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'inherit',  // Roboto, not Road Rage
                fontWeight: 600,
                fontSize: '1.25rem',
                lineHeight: 1.2,
                mb: 0.25,
              }}
            >
              Game playlist
            </Typography>
            {/* Live date + time stamp */}
            <Typography variant="caption" color="text.secondary">
              {dateStr} {timeStr}
            </Typography>
          </Box>
        </Box>

        {/* ── Action row: "Add game" + sort toggle ─────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5, pt: '16px', pb: '24px' }}>
          {/* "Add game" navigates back to CreateListScreen */}
          <Button
            variant="outlined" size="small"
            startIcon={<AddIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={onAddGame}
            sx={{
              borderRadius: 100, textTransform: 'none', fontSize: '0.875rem',
              px: 2, py: 0.75, borderColor: 'divider', color: 'text.primary',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(103,80,164,0.08)' },
            }}
          >
            Add game
          </Button>

          {/* Sort toggle — colour changes from brand purple to lighter purple once sorted */}
          <Button
            variant="text" size="small"
            startIcon={<SwapVertIcon sx={{ fontSize: '1.1rem !important', color: isSorted ? '#CFBDFE' : '#6750A4' }} />}
            onClick={handleWeightToggle}
            sx={{
              borderRadius: 100, textTransform: 'none', fontSize: '0.875rem',
              px: 1.5, color: isSorted ? '#CFBDFE' : '#6750A4',
              '&:hover': { bgcolor: 'rgba(103,80,164,0.08)' },
            }}
          >
            {weightLabel}
          </Button>
        </Box>
      </Box>

      {/* ── Scrollable game list ──────────────────────────────────────────── */}
      {/* pb: 14 reserves space above the fixed CTA so the last item is visible. */}
      <Box sx={{ flex: 1, overflow: 'auto', pb: 14 }}>
        {games.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
            <Typography variant="body2" color="text.secondary">No games in playlist</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {games.map((game) => (
              // ListItem renders as <li>, the correct semantic child for <ul> (List).
              // secondaryAction places the remove button at the far right of the row.
              <ListItem
                key={game.bggId || game.name}
                disablePadding
                sx={{ px: 2, py: 1 }}
                secondaryAction={
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label={`Remove ${game.name}`}
                    onClick={() => handleRemove(game)}
                    // Default to text.disabled so the X isn't visually loud;
                    // turns error red on hover as a warning before removal.
                    sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                }
              >
                {/* ── Thumbnail ─────────────────────────────────────────────── */}
                {/* Prefer thumbnail (small square) over full image for faster loading. */}
                {(game.thumbnailUrl || game.imageUrl) ? (
                  <Box
                    component="img"
                    src={game.thumbnailUrl || game.imageUrl}
                    alt={game.name}
                    sx={{ width: 48, height: 48, borderRadius: 0.5, objectFit: 'cover', flexShrink: 0, mr: 1 }}
                  />
                ) : (
                  // aria-hidden: placeholder is decorative — screen readers get the name from the Typography below.
                  <Box aria-hidden="true" sx={{
                    width: 48, height: 48, borderRadius: 0.5, flexShrink: 0, mr: 1,
                    background: 'linear-gradient(135deg, rgba(103,80,164,0.3) 0%, rgba(103,80,164,0.55) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                  }}>
                    {game.name.charAt(0)}
                  </Box>
                )}

                {/* ── Game name ─────────────────────────────────────────────── */}
                {/* flex: 1 makes the name fill available space between thumbnail and weight badge.
                    WebkitLineClamp: 2 clamps long titles to two lines with an ellipsis.
                    minWidth: 0 is required for text truncation inside flex containers. */}
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontWeight: 500,
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

                {/* ── Weight badge ───────────────────────────────────────────── */}
                {/* mr: 4 leaves room for the secondaryAction remove button. */}
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: '#2B292F',   // dark.surfaceContainerHigh
                    color: '#E6E0E9',    // dark.onSurface
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    mr: 4,
                  }}
                >
                  {game.weight}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* ── Fixed bottom CTA ──────────────────────────────────────────────── */}
      {/* Label changes based on whether we're starting fresh or resuming.
          Disabled when playlist is empty to prevent starting with no games. */}
      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        p: 2, display: 'flex', justifyContent: 'center',
        bgcolor: 'background.default',
      }}>
        <PrimaryButton
          size="large" onClick={onReady} disabled={games.length === 0}
          sx={{ width: '100%', maxWidth: 400, py: 1.5 }}
        >
          ▶ {isResuming ? 'Resume Session' : 'Ready to game'}
        </PrimaryButton>
      </Box>

      {/* ── "Game removed" snackbar ────────────────────────────────────────── */}
      {/* role="status" makes this a live region — screen readers announce
          it without interrupting the user's current focus. */}
      <Snackbar
        open={snackbarOpen} autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 84 } }}   // above the fixed CTA
      >
        <Box role="status" sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 3, py: 1.5, bgcolor: '#E6E0E9',
          borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '260px',
        }}>
          <Typography variant="body2" sx={{ color: '#322F35', flex: 1 }}>
            <strong>{lastRemovedGame?.name}</strong> removed from playlist
          </Typography>
          <IconButton size="small" aria-label="Dismiss notification" onClick={() => setSnackbarOpen(false)} sx={{ color: '#605D62', p: 0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>

      {/* ── "Sort applied" snackbar ────────────────────────────────────────── */}
      <Snackbar
        open={sortSnackbarOpen} autoHideDuration={3000}
        onClose={() => setSortSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 84 } }}
      >
        <Box role="status" sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 3, py: 1.5, bgcolor: '#E6E0E9',
          borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '260px',
        }}>
          <Typography variant="body2" sx={{ color: '#322F35', flex: 1 }}>
            Game order sorted to <strong>{sortLabel}</strong>
          </Typography>
          <IconButton size="small" aria-label="Dismiss notification" onClick={() => setSortSnackbarOpen(false)} sx={{ color: '#605D62', p: 0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>
    </Box>
  );
}