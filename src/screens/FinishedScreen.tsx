import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import UTurnRightIcon from '@mui/icons-material/UTurnRight';
import { Header } from '../components/Header';
import type { Game } from '../domain/types';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = {
  playlistGames: Game[];
  onRestart: () => void;
};

// ---------------------------------------------------------------------------
// Collage — reuses the same 2×2 pattern from PlaylistScreen but larger
// ---------------------------------------------------------------------------

const COVER_TINTS = [
  'rgba(103, 80, 164, 0.55)',
  'rgba(103, 80, 164, 0.35)',
  'rgba(103, 80, 164, 0.45)',
  'rgba(103, 80, 164, 0.25)',
];

function CollageCell({ game, idx }: { game?: Game; idx: number }) {
  return (game?.imageUrl || game?.thumbnailUrl) ? (
    <Box
      component="img"
      src={game.imageUrl || game.thumbnailUrl}
      alt={game?.name}
      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  ) : (
    <Box sx={{
      width: '100%', height: '100%',
      bgcolor: game ? COVER_TINTS[idx % COVER_TINTS.length] : 'rgba(103,80,164,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
    }}>
      {game?.name.charAt(0) ?? ''}
    </Box>
  );
}

function FinishedCollage({ games }: { games: Game[] }) {
  const cells = games.slice(0, 4);

  return (
    <Box sx={{
      width: '100%',
      aspectRatio: '1 / 1',
      borderRadius: 2,
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      bgcolor: 'rgba(103,80,164,0.15)',
    }}>
      {cells.length === 0 && (
        <Box
          aria-hidden="true"
          sx={{
          gridColumn: '1/-1', gridRow: '1/-1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(207,189,254,0.3)', fontSize: 64,
        }}>
          🎲
        </Box>
      )}
      {cells.length === 1 && (
        <Box sx={{ gridColumn: '1/-1', gridRow: '1/-1', overflow: 'hidden' }}>
          <CollageCell game={cells[0]} idx={0} />
        </Box>
      )}
      {cells.length >= 2 && [0, 1, 2, 3].map(i => (
        <CollageCell key={i} game={cells[i]} idx={i} />
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Total play time helper
// ---------------------------------------------------------------------------

function formatTotalTime(games: Game[]): string {
  const total = games.reduce((sum, g) => sum + (g.playingTime ?? 60), 0);
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}min` : `${h} hour${h !== 1 ? 's' : ''}`;
}

// ---------------------------------------------------------------------------
// FinishedScreen
// ---------------------------------------------------------------------------

export default function FinishedScreen({ playlistGames, onRestart }: Props) {
  const totalTime = formatTotalTime(playlistGames);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <Header />

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 14 }}>

        {/* "Game night complete" heading */}
        <Typography
          variant="titleLarge"
          align="center"
          sx={{ display: 'block', pt: 3, pb: 2.5, px: 2 }}
        >
          Game night complete
        </Typography>

        {/* Collage */}
        <Box sx={{ px: 2, mb: 0 }}>
          <FinishedCollage games={playlistGames} />
        </Box>

        {/* Date + total time row */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 2,
        }}>
          <Typography variant="titleLarge">
            {dateStr} Games
          </Typography>
          <Typography variant="body1">
            {totalTime} played
          </Typography>
        </Box>

        {/* Game list — ListItem gives proper <li> semantics inside the <ul> (List) */}
        <List disablePadding>
          {playlistGames.map((game) => (
            <ListItem
              key={game.bggId ?? game.name}
              sx={{
                justifyContent: 'space-between',
                px: 2,
                py: 1.75,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 400 }}>
                {game.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', textTransform: 'capitalize', flexShrink: 0, ml: 2 }}
              >
                {game.weight}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Fixed bottom CTA */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <PrimaryButton
          size="large"
          // UTurnRightIcon rotated 90 degrees counterclockwise to indicate "restart"
          startIcon={<UTurnRightIcon sx={{ transform: 'rotate(-90deg)' }} />}
          onClick={onRestart}
          sx={{
            width: '100%',
            maxWidth: 400,
            py: 1.5,
            }}
        >
          Start over
        </PrimaryButton>
      </Box>
    </Box>
  );
}