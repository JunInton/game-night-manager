import { useState } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
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
  onGamesChange: (games: Game[]) => void;
  onWeightPreferenceChange: (weight: "light" | "heavy") => void;
  onAddGame: () => void;
  onReady: () => void;
};

// ---------------------------------------------------------------------------
// PlaylistCover — 2×2 collage, minimal rounding (borderRadius: 1 = 4px)
// ---------------------------------------------------------------------------
function PlaylistCover({ games }: { games: Game[] }) {
  const coverGames = games.slice(0, 4);
  const tints = [
    'rgba(103, 80, 164, 0.55)',
    'rgba(103, 80, 164, 0.35)',
    'rgba(103, 80, 164, 0.45)',
    'rgba(103, 80, 164, 0.25)',
  ];

  const Cell = ({ game, idx }: { game?: Game; idx: number }) =>
    (game?.thumbnailUrl || game?.imageUrl) ? (
      <Box
        component="img"
        src={game.thumbnailUrl || game.imageUrl}
        alt={game.name}
        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <Box sx={{
        width: '100%', height: '100%',
        bgcolor: game ? tints[idx % tints.length] : 'rgba(103,80,164,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
      }}>
        {game?.name.charAt(0) ?? ''}
      </Box>
    );

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
  games, weightPreference, onGamesChange, onWeightPreferenceChange, onAddGame, onReady,
}: Props) {
  const [lastRemovedGame, setLastRemovedGame] = useState<Game | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleRemove = (game: Game) => {
    onGamesChange(games.filter(g => g.name !== game.name));
    setLastRemovedGame(game);
    setSnackbarOpen(true);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s/, '');

  // Toggle between only two states: "light" and "heavy" — no auto
  const handleWeightToggle = () => {
    onWeightPreferenceChange(weightPreference === 'light' ? 'heavy' : 'light');
  };

  const weightLabel = weightPreference === 'light' ? 'Light > Heavy' : 'Heavy > Light';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <Header />

      {/* ── Playlist header ── */}
      <Box sx={{ px: 2, pt: 0.5, pb: 1.5, flexShrink: 0 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
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
            startIcon={<SwapVertIcon sx={{ fontSize: '1.1rem !important', color: '#6750A4' }} />}
            onClick={handleWeightToggle}
            sx={{
              borderRadius: 100, textTransform: 'none', fontSize: '0.875rem',
              px: 1.5, color: '#6750A4',
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
              <ListItem
                key={game.bggId || game.name}
                secondaryAction={
                  <IconButton
                    edge="end" size="small"
                    aria-label={`Remove ${game.name}`}
                    onClick={() => handleRemove(game)}
                    sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ px: 2, py: 1 }}
              >
                {/* Thumbnail — borderRadius: 0.5 (2px) — very slight rounding */}
                {(game.thumbnailUrl || game.imageUrl) ? (
                  <Box
                    component="img"
                    src={game.thumbnailUrl || game.imageUrl}
                    alt={game.name}
                    sx={{ width: 48, height: 48, borderRadius: 0.5, objectFit: 'cover', mr: 1.5, flexShrink: 0 }}
                  />
                ) : (
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 0.5, mr: 1.5, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(103,80,164,0.3) 0%, rgba(103,80,164,0.55) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                  }}>
                    {game.name.charAt(0)}
                  </Box>
                )}
                <ListItemText
                  primary={game.name}
                  secondary={
                    <Chip
                      label={game.weight} size="small"
                      sx={{ mt: 0.5, height: 18, fontSize: '0.6875rem', textTransform: 'capitalize' }}
                    />
                  }
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500, sx: { mb: 0.25 } }}
                />
              </ListItem>
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
          ▶ Ready to game
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
    </Box>
  );
}