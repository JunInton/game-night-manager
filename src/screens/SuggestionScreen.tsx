import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import type { Game } from "../domain/types";
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';

type Props = {
  game: Game;
  allGames: Game[];
  nextWeight: "light" | "heavy";
  onConfirm: () => void;
  onVeto: () => void;
  onWeightPreferenceChange: (weight: "light" | "heavy") => void;
  onOverride: (selectedGame: Game) => void;
};

function PlaceholderArt() {
  return (
    <Box sx={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'rgba(103, 80, 164, 0.08)',
    }}>
      <svg width="180" height="160" viewBox="0 0 180 160" fill="none">
        <path d="M90 18C90 18 122 60 122 82C122 100.778 107.778 116 89 116C70.222 116 56 100.778 56 82C56 60 90 18Z"
          fill="rgba(207, 189, 254, 0.45)" />
        <g transform="translate(38, 108)">
          {[0, 30, 60, 90, 120, 150].map(angle => (
            <rect key={angle} x="-4" y="-18" width="8" height="36" rx="4"
              fill="rgba(207, 189, 254, 0.28)" transform={`rotate(${angle})`} />
          ))}
          <circle cx="0" cy="0" r="7" fill="rgba(207, 189, 254, 0.5)" />
        </g>
        <rect x="112" y="92" width="46" height="46" rx="8" fill="rgba(207, 189, 254, 0.35)" />
        <circle cx="90" cy="140" r="4" fill="rgba(207, 189, 254, 0.15)" />
        <circle cx="103" cy="146" r="3" fill="rgba(207, 189, 254, 0.1)" />
        <circle cx="77" cy="146" r="3" fill="rgba(207, 189, 254, 0.1)" />
      </svg>
    </Box>
  );
}

export default function SuggestionScreen({
  game, allGames, onConfirm, onVeto, onOverride,
}: Props) {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const otherGames = allGames.filter(g => g.name !== game.name);

  const handleOverrideSelect = (selected: Game) => {
    onOverride(selected);
    setOverrideOpen(false);
  };

  const formatPlayTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h} hour${h > 1 ? 's' : ''}`;
  };
  const playTimeLabel = formatPlayTime(game.playingTime) ?? '~1 hour';

  return (
    // ScreenLayout provides the Header and a scrollable content area.
    // We use position:fixed for the button row so it's always at the bottom.
    <ScreenLayout>
      {/* ── Big game image — square corners, bleeds to screen edges ── */}
      <Box sx={{
        width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
        mx: { xs: -2, sm: -3 },
        aspectRatio: '4 / 3',
        borderRadius: 0,
        overflow: 'hidden',
        // Extra bottom margin accounts for the fixed button row
        mb: 2.5,
        bgcolor: '#0f0d13',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {game.imageUrl ? (
          <Box
            component="img"
            src={game.imageUrl.startsWith('//') ? `https:${game.imageUrl}` : game.imageUrl}
            alt={game.name}
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <PlaceholderArt />
        )}
      </Box>

      {/* ── Game info ── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5, wordBreak: 'break-word' }}>
              {game.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estimated play time: {playTimeLabel}
            </Typography>
          </Box>
          <Chip
            label={game.weight} size="small"
            sx={{ mt: 0.25, flexShrink: 0, textTransform: 'capitalize' }}
          />
        </Box>
      </Box>

      {/* ── Fixed bottom action area ──
          Two rows:
            1. Play  — full-width PrimaryButton (tonal: light lavender bg, dark purple text)
            2. Skip | ˅  — split button with grey/surfaceVariant background
      ── */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        px: 2,
        pb: 3,
        pt: 1.5,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.5,
        maxWidth: 480,
        mx: 'auto',
      }}>
        {/* Play — takes ~2/3 of the row */}
        <PrimaryButton
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={onConfirm}
          sx={{ flex: 2, py: 1.5 }}
        >
          Play
        </PrimaryButton>

        {/* Skip + optional chevron — take ~1/3 of the row */}
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onVeto}
            sx={{
              flex: 1,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              bgcolor: '#49454E',
              color: '#E6E0E9',
              borderRadius: otherGames.length > 0 ? '100px 0 0 100px' : 100,
              '&:hover': { bgcolor: '#544F59', boxShadow: 'none' },
            }}
          >
            <SkipNextIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
            Skip
          </Button>

          {otherGames.length > 0 && (
            <Button
              variant="contained"
              size="large"
              onClick={() => setOverrideOpen(true)}
              aria-label="Choose a different game"
              sx={{
                minWidth: 0,
                px: 1.5,
                py: 1.5,
                boxShadow: 'none',
                bgcolor: '#49454E',
                color: '#E6E0E9',
                borderLeft: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0 100px 100px 0',
                '&:hover': { bgcolor: '#544F59', boxShadow: 'none' },
              }}
            >
              <KeyboardArrowDownIcon />
            </Button>
          )}
        </Box>
      </Box>

      {/* Extra padding so content doesn't hide behind the fixed button area */}
      <Box sx={{ height: 160 }} />

      {/* ── Override dialog ── */}
      <Dialog
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#211F24', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ pb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SwapVertIcon sx={{ color: '#6750A4', fontSize: '1.25rem' }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Choose a different game
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 1, maxHeight: '65vh', overflow: 'auto' }}>
          <List disablePadding>
            {otherGames.map((otherGame) => (
              <ListItem key={otherGame.name} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleOverrideSelect(otherGame)}
                  sx={{ borderRadius: 2, px: 1, '&:hover': { bgcolor: 'rgba(103,80,164,0.15)' } }}
                >
                  {(otherGame.thumbnailUrl || otherGame.imageUrl) ? (
                    <Box
                      component="img"
                      src={otherGame.thumbnailUrl || otherGame.imageUrl}
                      alt={otherGame.name}
                      sx={{ width: 44, height: 44, borderRadius: 0.5, objectFit: 'cover', mr: 1.5, flexShrink: 0 }}
                    />
                  ) : (
                    <Box sx={{
                      width: 44, height: 44, borderRadius: 0.5, mr: 1.5, flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(103,80,164,0.3) 0%, rgba(103,80,164,0.55) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                    }}>
                      {otherGame.name.charAt(0)}
                    </Box>
                  )}
                  <ListItemText
                    primary={otherGame.name}
                    secondary={
                      <Chip label={otherGame.weight} size="small"
                        sx={{ mt: 0.5, height: 18, fontSize: '0.6875rem', textTransform: 'capitalize' }} />
                    }
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </ScreenLayout>
  );
}