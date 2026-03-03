import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Game } from "../domain/types";
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';

type Props = {
  game: Game;
  onNext: () => void;
  onRestart: () => void;
};

/**
 * Shown while the current game is being played.
 * Mirrors the SuggestionScreen hero layout but is a simple holding screen —
 * the only primary action is "Next game" once they're done playing.
 */
export default function ConfirmScreen({ game, onNext, onRestart }: Props) {
  const formatPlayTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h} hour${h > 1 ? 's' : ''}`;
  };
  const playTimeLabel = formatPlayTime(game.playingTime) ?? '~1 hour';

  return (
    <ScreenLayout>
      {/* ── Now Playing label ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        mb: 1.5,
      }}>
        {/* <CheckCircleIcon sx={{ fontSize: '1rem', color: '#6750A4' }} /> */}
        <Typography
          variant="titleLarge"
          // sx={{
          //   color: '#6750A4',
          //   fontWeight: 600,
          //   textTransform: 'uppercase',
          //   letterSpacing: '0.08em',
          //   fontSize: '0.75rem',
          // }}
        >
          Now Playing
        </Typography>
      </Box>

      {/* ── Hero image — same bleeds-to-edges style as SuggestionScreen ── */}
      <Box sx={{
        width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
        mx: { xs: -2, sm: -3 },
        aspectRatio: '4 / 3',
        borderRadius: 0,
        overflow: 'hidden',
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
            label={game.weight}
            size="small"
            sx={{ mt: 0.25, flexShrink: 0, textTransform: 'capitalize' }}
          />
        </Box>
      </Box>

      {/* ── Fixed bottom action area ── */}
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
        <Button
          variant="text"
          onClick={onRestart}
          sx={{
            color: 'text.secondary',
            fontSize: '0.8rem',
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          Restart from beginning (testing only)
        </Button>
        <PrimaryButton
          size="large"
          onClick={onNext}
          sx={{ width: '100%', py: 1.5 }}
        >
          Next game
        </PrimaryButton>

      </Box>

      {/* Padding so content doesn't hide behind fixed button area */}
      <Box sx={{ height: 160 }} />
    </ScreenLayout>
  );
}