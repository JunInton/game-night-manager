import { useState } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
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
  weightPreference: "light" | "heavy";
  isSorted: boolean;
  onGamesChange: (games: Game[]) => void;
  onSort: (newPreference: "light" | "heavy", sortedGames: Game[]) => void;
  onAddGame: () => void;
  onReady: () => void;
  // True when the user navigates here mid-session via the hamburger menu
  isResuming?: boolean;
  onMainMenu?: () => void;
};

// ---------------------------------------------------------------------------
// PlaylistCover — 2×2 collage, minimal rounding (borderRadius: 1 = 4px)
// ---------------------------------------------------------------------------

const COVER_TINTS = [
  'rgba(103, 80, 164, 0.55)',
  'rgba(103, 80, 164, 0.35)',
  'rgba(103, 80, 164, 0.45)',
  'rgba(103, 80, 164, 0.25)',
];

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

function PlaylistCover({ games }: { games: Game[] }) {
  const coverGames = games.slice(0, 4);

  return (
    <Box sx={{
      width: 80, height: 80,
      // Minimal rounding — 4px matches the slight corner rounding visible in Figma
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

// ---------------------------------------------------------------------------
// PlaylistScreen
// ---------------------------------------------------------------------------
export default function PlaylistScreen({
  games, weightPreference, isSorted, onGamesChange, onSort, onAddGame, onReady,
  isResuming = false, onMainMenu,
}: Props) {
  const [lastRemovedGame, setLastRemovedGame] = useState<Game | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sortSnackbarOpen, setSortSnackbarOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState("");

  const handleRemove = (game: Game) => {
    onGamesChange(games.filter(g => g.name !== game.name));
    setLastRemovedGame(game);
    setSnackbarOpen(true);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s/, '');

  // Shuffle an array in place using Fisher-Yates and return it
  const shuffle = <T,>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Interleave light and heavy games starting with the preferred weight.
  // Each weight group is shuffled first so repeated sorts produce fresh orderings.
  const sortGamesByWeight = (gamesToSort: Game[], firstWeight: "light" | "heavy"): Game[] => {
    const secondWeight = firstWeight === 'light' ? 'heavy' : 'light';
    const first = shuffle(gamesToSort.filter(g => g.weight === firstWeight));
    const second = shuffle(gamesToSort.filter(g => g.weight === secondWeight));
    const result: Game[] = [];
    const maxLen = Math.max(first.length, second.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < first.length) result.push(first[i]);
      if (i < second.length) result.push(second[i]);
    }
    return result;
  };

  const handleWeightToggle = () => {
    const newPreference = weightPreference === 'light' ? 'heavy' : 'light';
    const sorted = sortGamesByWeight(games, newPreference);
    onSort(newPreference, sorted);
    const label = newPreference === 'light' ? 'Light > Heavy' : 'Heavy > Light';
    setSortLabel(label);
    setSortSnackbarOpen(true);
  };

  const weightLabel = weightPreference === 'light' ? 'Light > Heavy' : 'Heavy > Light';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <Header onMainMenu={onMainMenu} />

      {/* ── Playlist header ── */}
      <Box sx={{ px: 2, pt: '16px', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PlaylistCover games={games} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* "Game playlist" — regular body typography, not Road Rage */}
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'inherit',  // use Roboto, not Road Rage
                fontWeight: 600,
                fontSize: '1.25rem',
                lineHeight: 1.2,
                mb: 0.25,
              }}
            >
              Game playlist
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dateStr} {timeStr}
            </Typography>
          </Box>
        </Box>

        {/* Action row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5, pt: '16px', pb: '24px' }}>
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

      {/* ── Game list ── */}
      <Box sx={{ flex: 1, overflow: 'auto', pb: 14 }}>
        {games.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
            <Typography variant="body2" color="text.secondary">No games in playlist</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {games.map((game) => (
              <Box
                key={game.bggId || game.name}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1 }}
              >
                {/* Thumbnail */}
                {(game.thumbnailUrl || game.imageUrl) ? (
                  <Box
                    component="img"
                    src={game.thumbnailUrl || game.imageUrl}
                    alt={game.name}
                    sx={{ width: 48, height: 48, borderRadius: 0.5, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 0.5, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(103,80,164,0.3) 0%, rgba(103,80,164,0.55) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                  }}>
                    {game.name.charAt(0)}
                  </Box>
                )}

                {/* Name — grows, clamps at 2 lines */}
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

                {/* Weight badge */}
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: '#2B292F',
                    color: '#E6E0E9',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {game.weight}
                </Box>

                {/* Delete icon */}
                <IconButton
                  size="small"
                  aria-label={`Remove ${game.name}`}
                  onClick={() => handleRemove(game)}
                  sx={{ color: 'text.disabled', flexShrink: 0, '&:hover': { color: 'error.main' } }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </List>
        )}
      </Box>

      {/* ── Fixed bottom CTA — PrimaryButton (tonal style) ── */}
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

      {/* ── Delete snackbar ── */}
      <Snackbar
        open={snackbarOpen} autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 84 } }}
      >
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 3, py: 1.5, bgcolor: '#E6E0E9',
          borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '260px',
        }}>
          <Typography variant="body2" sx={{ color: '#322F35', flex: 1 }}>
            <strong>{lastRemovedGame?.name}</strong> removed from playlist
          </Typography>
          <IconButton size="small" onClick={() => setSnackbarOpen(false)} sx={{ color: '#605D62', p: 0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>
      {/* ── Sort snackbar ── */}
      <Snackbar
        open={sortSnackbarOpen} autoHideDuration={3000}
        onClose={() => setSortSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 84 } }}
      >
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 3, py: 1.5, bgcolor: '#E6E0E9',
          borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '260px',
        }}>
          <Typography variant="body2" sx={{ color: '#322F35', flex: 1 }}>
            Game order sorted to <strong>{sortLabel}</strong>
          </Typography>
          <IconButton size="small" onClick={() => setSortSnackbarOpen(false)} sx={{ color: '#605D62', p: 0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>
    </Box>
  );
}