import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import type { Game } from "../domain/types";
import { ScreenLayout } from '../components/ScreenLayout';

type Props = {
  game: Game;
  onNext: () => void;       // called when gameplay is done — moves to next suggestion
  onRestart: () => void;    // currently unused (button is commented out), kept for future use
  onViewPlaylist: () => void;
  onMainMenu: () => void;
};

/**
 * Shown while the current game is being played.
 * Mirrors the SuggestionScreen hero layout but is a simple holding screen —
 * the only primary action is "Finish gameplay" once they're done playing.
 * The user can still open the hamburger menu to view/edit the playlist or
 * return to the main menu.
 */
export default function ConfirmScreen({ game, onNext, onViewPlaylist, onMainMenu }: Props) {
  // Converts a raw minutes number into a human-readable label.
  // < 60 min → "45 min"
  // exactly N hours → "2 hours"
  // hours + remainder → "1h 30min"
  const formatPlayTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h} hour${h > 1 ? 's' : ''}`;
  };
  // Fall back to "~1 hour" when BGG doesn't provide a playing time.
  const playTimeLabel = formatPlayTime(game.playingTime) ?? '~1 hour';

  return (
    <ScreenLayout headerProps={{ onViewPlaylist, onMainMenu }}>

      {/* ── "Now Playing" label ────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pb: 1.5,
        gap: 0.75,
        mb: 1.5,
      }}>
        <Typography variant="titleLarge">
          Now Playing
        </Typography>
      </Box>

      {/* ── Hero image ─────────────────────────────────────────────────────── */}
      {/* Same full-bleed layout as SuggestionScreen:
          width: calc(100% + 32px) on xs overrides the ScreenLayout padding so the
          image bleeds to the left and right edges of the screen.
          mx: -2 (= -16px) pulls the box into the negative margin to achieve the bleed. */}
      <Box sx={{
        width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
        mx: { xs: -2, sm: -3 },
        aspectRatio: '4 / 3',
        borderRadius: 0,   // square corners — no rounding for full-bleed images
        overflow: 'hidden',
        mb: 2.5,
        bgcolor: '#0f0d13',   // very dark bg so transparent PNGs look good
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {game.imageUrl ? (
          <Box
            component="img"
            // BGG sometimes returns protocol-relative URLs ("//cdn…"); prefix with https:.
            src={game.imageUrl.startsWith('//') ? `https:${game.imageUrl}` : game.imageUrl}
            alt={game.name}
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          // No image — show a subtle dice emoji as a placeholder.
          <Box sx={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(103, 80, 164, 0.08)',
          }}>
            <Typography sx={{ fontSize: 96, lineHeight: 1, color: 'rgba(207,189,254,0.25)' }}>
              🎲
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Game info ──────────────────────────────────────────────────────── */}
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
          {/* Weight chip — top-right of the name block, never shrinks */}
          <Chip
            label={game.weight}
            size="small"
            sx={{ mt: 0.25, flexShrink: 0, textTransform: 'capitalize' }}
          />
        </Box>
      </Box>

      {/* ── Fixed bottom action area ────────────────────────────────────────── */}
      {/* position: fixed keeps the button at the bottom of the viewport even
          when the page content is taller than the screen. maxWidth + mx: auto
          centres it in the app-frame column on wider screens. */}
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
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        maxWidth: 480,
        mx: 'auto',
      }}>
        {/* "Restart from beginning" button — currently commented out (testing only).
            Uncomment to show a dev shortcut that calls onRestart directly.
        <Button variant="text" onClick={onRestart} sx={{ … }}>
          Restart from beginning (testing only)
        </Button> */}

        {/*
          "Finish gameplay" button.
          Styled as a dark outlined button (not the tonal PrimaryButton) to indicate
          this ends the current game without being as prominent as a CTA.
            bgcolor:  transparent
            color:    dark.primary (#CFBDFE — light purple)
            border:   dark.outlineVariant (#49454E)
          Clicking calls onNext, which triggers goToSuggestion in App.tsx.
        */}
        <Button
          variant="contained"
          size="large"
          startIcon={<StopCircleOutlinedIcon />}
          onClick={onNext}
          sx={{
            width: '100%',
            py: 1.5,
            borderRadius: 100,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            bgcolor: 'transparent',
            color: '#CFBDFE',            // dark.primary (light purple)
            border: '1px solid #49454E', // dark.outlineVariant
            '&:hover': {
              bgcolor: '#36343A',         // dark.surfaceContainerHighest — subtle fill on hover
              boxShadow: 'none',
            },
          }}
        >
          Finish gameplay
        </Button>

      </Box>

      {/* Spacer so scrollable content doesn't hide behind the fixed button area */}
      <Box sx={{ height: 160 }} />
    </ScreenLayout>
  );
}