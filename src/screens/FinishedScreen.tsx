import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import UTurnRightIcon from '@mui/icons-material/UTurnRight';
import { Header } from '../components/Header';
import type { Game } from '../domain/types';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = {
  playlistGames: Game[];   // the games that were actually played (session.playedGames)
  onRestart: () => void;   // resets everything and goes back to StartScreen
};

// ─── Collage helpers ──────────────────────────────────────────────────────────
// Four purple tints used as backgrounds for cells that have no cover art.
// Different opacities give the collage visual variety instead of four identical squares.
const COVER_TINTS = [
  'rgba(103, 80, 164, 0.55)',
  'rgba(103, 80, 164, 0.35)',
  'rgba(103, 80, 164, 0.45)',
  'rgba(103, 80, 164, 0.25)',
];

// ─── CollageCell ──────────────────────────────────────────────────────────────
// Renders one cell of the 2×2 collage. If the game has an image, shows it.
// Otherwise shows a coloured placeholder with the game's initial letter.
// idx is used to pick a tint colour — each cell gets a different shade.
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
      // If game is undefined (fewer than 4 games played), use a very light tint.
      bgcolor: game ? COVER_TINTS[idx % COVER_TINTS.length] : 'rgba(103,80,164,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
    }}>
      {/* First letter of the game name, or empty string if no game */}
      {game?.name.charAt(0) ?? ''}
    </Box>
  );
}

// ─── FinishedCollage ──────────────────────────────────────────────────────────
// Renders a 2×2 grid collage from the first 1–4 played games.
// Layout adjusts based on how many games were played:
//   0 games → centred dice emoji
//   1 game  → single full-size image spanning all 4 cells
//   2–4     → each game fills one cell (missing cells become placeholder squares)
function FinishedCollage({ games }: { games: Game[] }) {
  // Only use the first 4 games even if more were played.
  const cells = games.slice(0, 4);

  return (
    <Box sx={{
      width: '100%',
      aspectRatio: '1 / 1',   // always a square
      borderRadius: 2,
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      bgcolor: 'rgba(103,80,164,0.15)',  // fallback if all cells are transparent
    }}>
      {/* Edge case: no games played at all */}
      {cells.length === 0 && (
        <Box
          aria-hidden="true"
          sx={{
          gridColumn: '1/-1', gridRow: '1/-1',  // span the full 2×2 grid
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(207,189,254,0.3)', fontSize: 64,
        }}>
          🎲
        </Box>
      )}
      {/* Special case: exactly 1 game — show it full-size across all cells */}
      {cells.length === 1 && (
        <Box sx={{ gridColumn: '1/-1', gridRow: '1/-1', overflow: 'hidden' }}>
          <CollageCell game={cells[0]} idx={0} />
        </Box>
      )}
      {/* 2–4 games: render each cell. If cells[2] or cells[3] are undefined
          (only 2 or 3 games played), CollageCell renders a placeholder square. */}
      {cells.length >= 2 && [0, 1, 2, 3].map(i => (
        <CollageCell key={i} game={cells[i]} idx={i} />
      ))}
    </Box>
  );
}

// ─── formatTotalTime ──────────────────────────────────────────────────────────
// Sums up the playing time of all games played and formats it as a readable string.
// Falls back to 60 min per game when a game has no playingTime from BGG.
function formatTotalTime(games: Game[]): string {
  const total = games.reduce((sum, g) => sum + (g.playingTime ?? 60), 0);
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  // "2 hours" (no minutes) vs "1h 30min"
  return m > 0 ? `${h}h ${m}min` : `${h} hour${h !== 1 ? 's' : ''}`;
}

// ─── FinishedScreen ───────────────────────────────────────────────────────────
// Shown when the game pool is exhausted or the user ends the night early.
// Displays a collage of the games played, total time, a date stamp, and a
// scrollable list of each game with its weight label.
export default function FinishedScreen({ playlistGames, onRestart }: Props) {
  const totalTime = formatTotalTime(playlistGames);

  // Date label for the session — shown as "Mar 6 Games" style.
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    // Full-height column layout: Header is fixed at the top, body scrolls, CTA is fixed at the bottom.
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>

      {/* Header with no callbacks — no hamburger menu on this screen */}
      <Header />

      {/* Scrollable body — pb: 14 prevents content from hiding behind the fixed CTA */}
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 14 }}>

        <Typography
          variant="titleLarge"
          align="center"
          sx={{ display: 'block', pt: 3, pb: 2.5, px: 2 }}
        >
          Game night complete
        </Typography>

        {/* Collage — full-width square, padded to match the page gutters */}
        <Box sx={{ px: 2, mb: 0 }}>
          <FinishedCollage games={playlistGames} />
        </Box>

        {/* Date + total time row — spaced so date is left-aligned, time is right */}
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

        {/* Game list — uses MUI List/ListItem for correct <ul>/<li> semantics.
            bggId is preferred as the key (stable across renames); falls back to name. */}
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
              {/* Weight label — textTransform: capitalize turns "light" → "Light" */}
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

      {/* ── Fixed bottom CTA ──────────────────────────────────────────────── */}
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
          // UTurnRightIcon points to the upper-right by default; rotating -90°
          // makes it point left — visually suggesting "go back to the start".
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