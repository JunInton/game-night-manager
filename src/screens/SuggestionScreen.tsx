import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CloseIcon from '@mui/icons-material/Close';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import type { Game } from "../domain/types";
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';

// ─── Props ────────────────────────────────────────────────────────────────────
// game         – the currently suggested game to display
// allGames     – remaining games in the pool (used to populate the "pick a game" list)
// nextWeight   – the weight preference, used only by the parent (App) to decide
//               the next suggestion; not directly read here
// onConfirm    – user chose to play this game
// onSkip       – user doesn't want to play now; game is reinserted later in queue
// onRemove     – user permanently removes this game from tonight's session
// onWeightPreferenceChange – user tapped the weight toggle (currently in the sheet)
// onOverride   – user manually selected a different game from the picker
// onViewPlaylist – opens PlaylistScreen via the hamburger menu
// onMainMenu   – resets the whole session via the hamburger menu
// onEndNight   – user wants to wrap up; triggers FinishedScreen
type Props = {
  game: Game;
  allGames: Game[];
  nextWeight: "light" | "heavy";
  onConfirm: () => void;
  onSkip: () => void;
  onRemove: () => void;
  onWeightPreferenceChange: (weight: "light" | "heavy") => void;
  onOverride: (selectedGame: Game) => void;
  onViewPlaylist: () => void;
  onMainMenu: () => void;
  onEndNight: () => void;
};

// ─── PlaceholderArt ───────────────────────────────────────────────────────────
// Inline SVG fallback shown in the hero image area when the suggested game has
// no imageUrl. Built from abstract game-related shapes (droplet, spoke wheel,
// square board) using the brand purple at various opacities so it looks
// intentional rather than broken.
function PlaceholderArt() {
  return (
    <Box sx={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'rgba(103, 80, 164, 0.08)',  // very faint purple bg
    }}>
      {/* aria-hidden: purely decorative — screen readers should skip it */}
      <svg aria-hidden="true" width="180" height="160" viewBox="0 0 180 160" fill="none">
        {/* Droplet / teardrop shape — abstract game piece */}
        <path d="M90 18C90 18 122 60 122 82C122 100.778 107.778 116 89 116C70.222 116 56 100.778 56 82C56 60 90 18Z"
          fill="rgba(207, 189, 254, 0.45)" />
        {/* Spoke wheel — represents a board game spinner/die.
            Six rects rotated at 30° intervals, plus a centre circle. */}
        <g transform="translate(38, 108)">
          {[0, 30, 60, 90, 120, 150].map(angle => (
            <rect key={angle} x="-4" y="-18" width="8" height="36" rx="4"
              fill="rgba(207, 189, 254, 0.28)" transform={`rotate(${angle})`} />
          ))}
          <circle cx="0" cy="0" r="7" fill="rgba(207, 189, 254, 0.5)" />
        </g>
        {/* Square — represents a game board tile */}
        <rect x="112" y="92" width="46" height="46" rx="8" fill="rgba(207, 189, 254, 0.35)" />
        {/* Small scattered circles — abstract tokens/meeples */}
        <circle cx="90" cy="140" r="4" fill="rgba(207, 189, 254, 0.15)" />
        <circle cx="103" cy="146" r="3" fill="rgba(207, 189, 254, 0.1)" />
        <circle cx="77" cy="146" r="3" fill="rgba(207, 189, 254, 0.1)" />
      </svg>
    </Box>
  );
}

export default function SuggestionScreen({
  game, allGames, onConfirm, onSkip, onRemove, onOverride, onViewPlaylist, onMainMenu, onEndNight
}: Props) {
  // ─── Local state ────────────────────────────────────────────────────────────
  // overrideOpen controls the "Change game" bottom sheet drawer.
  const [overrideOpen, setOverrideOpen] = useState(false);
  // pickGameOpen toggles between the two views inside the override drawer:
  //   false → View 1: two options ("Switch weight" / "Pick a game" / "Remove" / "End Night")
  //   true  → View 2: full scrollable game picker list
  const [pickGameOpen, setPickGameOpen] = useState(false);

  // Skip snackbar — confirms to the user that the skipped game was moved back in the queue.
  const [skipSnackbarOpen, setSkipSnackbarOpen] = useState(false);
  const [skippedGameName, setSkippedGameName] = useState('');

  // Remove snackbar — confirms the game was permanently removed from tonight's session.
  const [removeSnackbarOpen, setRemoveSnackbarOpen] = useState(false);
  const [removedGameName, setRemovedGameName] = useState('');

  // End Night confirmation dialog — two-step to prevent accidental early endings.
  const [endNightConfirmOpen, setEndNightConfirmOpen] = useState(false);

  // All games in the pool except the currently shown game.
  // Used for the "Switch weight" logic and the game picker list.
  const otherGames = allGames.filter(g => g.name !== game.name);

  // ─── Event handlers ──────────────────────────────────────────────────────
  // Capture the name before calling onSkip so the snackbar shows the right
  // game even after the parent has already moved to the next suggestion.
  const handleSkip = () => {
    setSkippedGameName(game.name);
    setSkipSnackbarOpen(true);
    onSkip();
  };

  const handleRemove = () => {
    setRemovedGameName(game.name);
    setRemoveSnackbarOpen(true);
    // Close the drawer before the parent re-renders (avoids a visible flash).
    setOverrideOpen(false);
    setPickGameOpen(false);
    onRemove();
  };

  // User selected a specific game from the picker list.
  const handleOverrideSelect = (selected: Game) => {
    onOverride(selected);
    setOverrideOpen(false);
    setPickGameOpen(false);
  };

  // Closes the bottom sheet and resets both views back to View 1.
  const handleSheetClose = () => {
    setOverrideOpen(false);
    setPickGameOpen(false);
  };

  // ─── formatPlayTime ─────────────────────────────────────────────────────
  // Converts a raw minutes number into a readable label.
  //   < 60   → "45 min"
  //   exactly → "2 hours"
  //   mixed  → "1h 30min"
  const formatPlayTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h} hour${h > 1 ? 's' : ''}`;
  };
  // Default to "~1 hour" when BGG has no playing time for this game.
  const playTimeLabel = formatPlayTime(game.playingTime) ?? '~1 hour';

  return (
    // ScreenLayout provides the Header and a scrollable content area.
    // We use position:fixed for the button row so it's always at the bottom.
    <ScreenLayout headerProps={{ onViewPlaylist, onMainMenu }}>

      {/* ── Hero image ──────────────────────────────────────────────────────
          Full-bleed design: the negative left/right margin (mx: -2 = -16px on xs)
          combined with the wider width (calc(100% + 32px)) makes the image
          extend past the ScreenLayout's inner padding to touch the screen edges.
          This is a common mobile pattern for "hero" images.
      ── */}
      <Box sx={{
        width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
        mx: { xs: -2, sm: -3 },
        aspectRatio: '4 / 3',
        borderRadius: 0,      // square corners — the bleed effect requires no rounding
        overflow: 'hidden',
        mb: 2.5,
        bgcolor: '#0f0d13',   // very dark bg; transparent PNGs look clean against it
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {game.imageUrl ? (
          <Box
            component="img"
            // BGG sometimes returns protocol-relative URLs ("//cdn…"); normalise to https.
            src={game.imageUrl.startsWith('//') ? `https:${game.imageUrl}` : game.imageUrl}
            alt={game.name}
            // objectFit: 'contain' shows the full image without cropping,
            // letterboxed against the dark background if the aspect ratio differs.
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <PlaceholderArt />
        )}
      </Box>

      {/* ── Game info block ─────────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            {/* wordBreak: 'break-word' prevents very long game titles from overflowing
                the container and pushing the weight chip off-screen. */}
            <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5, wordBreak: 'break-word' }}>
              {game.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estimated play time: {playTimeLabel}
            </Typography>
          </Box>
          {/* Weight chip — flexShrink: 0 keeps it from squishing when the name is long */}
          <Chip
            label={game.weight} size="small"
            sx={{ mt: 0.25, flexShrink: 0, textTransform: 'capitalize' }}
          />
        </Box>
      </Box>

      {/* ── Fixed bottom action row ──────────────────────────────────────────
          Two-button row pinned to the bottom of the viewport:
            [  Play (flex: 2)  ]  [ Skip | ˅ (flex: 1) ]
          "Play" takes ~2/3 of the row width; the Skip/chevron split takes ~1/3.
          maxWidth: 480 + mx: auto centres it inside the app-frame column.
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
        {/* ── Play button ─────────────────────────────────────────────────── */}
        {/* PrimaryButton = M3 filled tonal (light lavender bg, dark purple text).
            flex: 2 gives it roughly twice the width of the Skip button. */}
        <PrimaryButton
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={onConfirm}
          sx={{ flex: 2, py: 1.5 }}
        >
          Play
        </PrimaryButton>

        {/* ── Skip + chevron (split button) ──────────────────────────────── */}
        {/* This is a "split button" pattern: two buttons that share a visual
            container but have separate actions.
            Left half  → Skip (calls handleSkip)
            Right half → ˅ chevron (opens the override drawer)
            Both share the same dark grey bg (#49454E = dark.outlineVariant).
            Split by rounding opposite corners: Skip has left-pill shape,
            chevron has right-pill shape, with a faint divider between them. */}
        <Box sx={{ flex: 1, display: 'flex' }}>
          {/* Skip — disabled when this is the only remaining game (can't skip nothing) */}
          <Button
            variant="contained"
            size="large"
            onClick={handleSkip}
            disabled={otherGames.length === 0}
            sx={{
              flex: 1,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              bgcolor: '#49454E',            // dark.outlineVariant
              color: '#E6E0E9',              // dark.onSurface
              borderRadius: '100px 0 0 100px', // left-pill: round left, square right
              '&:hover': { bgcolor: '#544F59', boxShadow: 'none' },
              '&.Mui-disabled': {
                bgcolor: '#2C2A2F',
                color: 'rgba(230, 224, 233, 0.35)',
              },
            }}
          >
            <SkipNextIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
            Skip
          </Button>

          {/* Chevron — always enabled; opens the "Change game" drawer */}
          <Button
            variant="contained"
            size="large"
            onClick={() => setOverrideOpen(true)}
            aria-label="More options"
            sx={{
              minWidth: 0,
              px: 1.5,
              py: 1.5,
              boxShadow: 'none',
              bgcolor: '#49454E',
              color: '#E6E0E9',
              // Faint vertical divider between Skip and the chevron
              borderLeft: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0 100px 100px 0', // right-pill: square left, round right
              '&:hover': { bgcolor: '#544F59', boxShadow: 'none' },
            }}
          >
            <KeyboardArrowDownIcon />
          </Button>
        </Box>
      </Box>

      {/* Spacer so content doesn't hide behind the fixed button row.
          Height is generous to account for the two-row layout on small screens. */}
      <Box sx={{ height: 160 }} />

      {/* ── Override bottom sheet ────────────────────────────────────────────
          A MUI Drawer anchored to the bottom is the standard M3 "bottom sheet" pattern.
          It slides up from the bottom edge instead of appearing as a centred dialog.

          Two views are toggled by pickGameOpen inside the same Drawer:
            View 1 (pickGameOpen=false): Four options as radio-style list items
              1. Switch to a [opposite] game — picks the first game of the opposite weight
              2. Pick a game — switches to View 2
              3. Remove from playlist — permanently removes current game
              4. End the Night early — triggers the confirmation dialog
            View 2 (pickGameOpen=true): Full scrollable list of remaining games

          aria-labelledby links the Drawer to its visible heading so screen readers
          announce the sheet title when it opens.
      ── */}
      <Drawer
        anchor="bottom"
        open={overrideOpen}
        onClose={handleSheetClose}
        aria-labelledby="override-sheet-title"
        PaperProps={{
          sx: {
            borderRadius: '28px 28px 0 0',  // M3 bottom sheet: rounded top corners
            bgcolor: '#211F24',              // dark.surfaceContainer
            backgroundImage: 'none',
            maxWidth: 480,
            mx: 'auto',
            left: 0,
            right: 0,
          },
        }}
      >
        {/* Drag handle — purely decorative visual cue that the sheet is dismissable.
            aria-hidden so screen readers don't announce it. */}
        <Box aria-hidden="true" sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 32, height: 4, borderRadius: 2, bgcolor: '#49454E' }} />
        </Box>

        {!pickGameOpen ? (
          /* ── View 1: four action options ──────────────────────────────── */
          <Box sx={{ px: 2, pb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              {/* id="override-sheet-title" matches aria-labelledby on the Drawer */}
              <Typography id="override-sheet-title" variant="titleLarge" sx={{ px: '24px' }}>
                Change game
              </Typography>
              <IconButton size="small" onClick={handleSheetClose} aria-label="Close options" sx={{ color: 'text.secondary' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <List disablePadding>
              {/* ── Option 1: Switch to opposite weight ─────────────────────
                  Finds the first game of the opposite weight and passes it to
                  onOverride. Falls back to otherGames[0] if none of that weight exist.
                  Disabled when there are no other games to switch to. */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  disabled={otherGames.length === 0}
                  onClick={() => {
                    const oppositeWeight = game.weight === 'heavy' ? 'light' : 'heavy';
                    // Try to find a game of the opposite weight; fall back to any game.
                    const match = otherGames.find(g => g.weight === oppositeWeight)
                      ?? otherGames[0];
                    if (match) handleOverrideSelect(match);
                  }}
                  sx={{
                    borderRadius: 3,
                    px: 2, py: 1.5,
                    '&:hover': { bgcolor: 'rgba(103,80,164,0.12)' },
                    '&.Mui-disabled': { opacity: 0.38 },
                  }}
                >
                  {/* Radio-style bullet — filled circle inside a ringed circle */}
                  <Box sx={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: '2px solid #CFBDFE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mr: 2, flexShrink: 0,
                  }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#CFBDFE' }} />
                  </Box>
                  <ListItemText
                    // Label dynamically reflects the current game's weight.
                    primary={`Switch to a ${game.weight === 'heavy' ? 'light' : 'heavy'} game`}
                    secondary={game.weight === 'heavy'
                      ? 'Play a shorter, more casual game'
                      : 'Play a longer, more complex game'}
                    primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                  <ArrowRightIcon sx={{ color: 'text.secondary', ml: 1 }} />
                </ListItemButton>
              </ListItem>

              {/* ── Option 2: Pick a specific game ──────────────────────────
                  Opens View 2 — the full game picker list. */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  disabled={otherGames.length === 0}
                  onClick={() => setPickGameOpen(true)}
                  sx={{
                    borderRadius: 3,
                    px: 2, py: 1.5,
                    '&:hover': { bgcolor: 'rgba(103,80,164,0.12)' },
                    '&.Mui-disabled': { opacity: 0.38 },
                  }}
                >
                  <Box sx={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: '2px solid #CFBDFE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mr: 2, flexShrink: 0,
                  }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#CFBDFE' }} />
                  </Box>
                  <ListItemText
                    primary="Pick a game"
                    secondary="Choose a specific game from your playlist"
                    primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                  <ArrowRightIcon sx={{ color: 'text.secondary', ml: 1 }} />
                </ListItemButton>
              </ListItem>

              {/* ── Option 3: Remove from playlist ─────────────────────────
                  Destructive — coloured red (#FFB4AB = dark.error) to signal danger. */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleRemove}
                  sx={{
                    borderRadius: 3,
                    px: 2, py: 1.5,
                    // Red tint on hover instead of the usual purple
                    '&:hover': { bgcolor: 'rgba(186, 26, 26, 0.12)' },
                  }}
                >
                  <Box sx={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: '2px solid #FFB4AB',  // dark.error
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mr: 2, flexShrink: 0,
                  }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FFB4AB' }} />
                  </Box>
                  <ListItemText
                    primary="Remove from playlist"
                    secondary="Permanently remove this game from tonight's list"
                    // Red primary text reinforces the destructive nature
                    primaryTypographyProps={{ variant: 'body1', fontWeight: 500, color: '#FFB4AB' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                  <ArrowRightIcon sx={{ color: 'text.secondary', ml: 1 }} />
                </ListItemButton>
              </ListItem>

              {/* Visual separator before the "End the Night" option.
                  Groups the session-ending action away from the game-switching actions. */}
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />

              {/* ── Option 4: End the Night early ──────────────────────────
                  Closes the drawer then opens the confirmation dialog (two-step)
                  to prevent accidentally ending the session. */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setOverrideOpen(false);
                    setEndNightConfirmOpen(true);
                  }}
                  sx={{
                    borderRadius: 3,
                    px: 2, py: 1.5,
                    '&:hover': { bgcolor: 'rgba(186, 26, 26, 0.12)' },
                  }}
                >
                  <NightsStayIcon sx={{ color: '#FFB4AB', mr: 2, flexShrink: 0, fontSize: '1.25rem' }} />
                  <ListItemText
                    primary="End the Night early"
                    secondary="Wrap up and see a summary of what you played"
                    primaryTypographyProps={{ variant: 'body1', fontWeight: 500, color: '#FFB4AB' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        ) : (
          /* ── View 2: full game picker ────────────────────────────────────
              Scrollable list of all other remaining games, each with a
              thumbnail, name, and weight badge.
              Tapping a game calls handleOverrideSelect, which calls onOverride
              in App.tsx → stored as overriddenGame → used by goToSuggestion. */
          <Box sx={{ pb: 3 }}>
            {/* Back arrow + title + close button */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => setPickGameOpen(false)}
                sx={{ color: 'text.secondary' }}
                aria-label="Back"
              >
                {/* ArrowRightIcon rotated 180° acts as a left-pointing back chevron */}
                <ArrowRightIcon sx={{ transform: 'rotate(180deg)' }} />
              </IconButton>
              <Typography variant="titleLarge" sx={{ flex: 1 }}>
                Pick a game to skip to
              </Typography>
              <IconButton size="small" onClick={handleSheetClose} aria-label="Close game picker" sx={{ color: 'text.secondary' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Scrollable list — maxHeight: 55vh prevents it from filling the whole screen */}
            <List disablePadding sx={{ maxHeight: '55vh', overflow: 'auto', px: 1 }}>
              {otherGames.map((otherGame) => (
                <ListItem key={otherGame.name} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleOverrideSelect(otherGame)}
                    sx={{
                      borderRadius: 2, px: 1.5,
                      '&:hover': { bgcolor: 'rgba(103,80,164,0.12)' },
                    }}
                  >
                    {/* Thumbnail — prefer thumbnailUrl (small), fall back to imageUrl */}
                    {(otherGame.thumbnailUrl || otherGame.imageUrl) ? (
                      <Box
                        component="img"
                        src={otherGame.thumbnailUrl || otherGame.imageUrl}
                        alt={otherGame.name}
                        sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover', mr: 1.5, flexShrink: 0 }}
                      />
                    ) : (
                      // Gradient placeholder with first letter monogram
                      <Box sx={{
                        width: 56, height: 56, borderRadius: 1, mr: 1.5, flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(103,80,164,0.3) 0%, rgba(103,80,164,0.55) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                      }}>
                        {otherGame.name.charAt(0)}
                      </Box>
                    )}

                    {/* Game name — flex: 1 fills space; clamped to 2 lines */}
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
                      {otherGame.name}
                    </Typography>

                    {/* Weight badge — compact pill, never wraps */}
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
                      {otherGame.weight}
                    </Box>
                    <ArrowRightIcon sx={{ color: 'text.secondary', ml: 1, flexShrink: 0 }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Drawer>

      {/* ── Skip snackbar ─────────────────────────────────────────────────── */}
      {/* Positioned above the fixed button row (bottom: 100px) so it doesn't overlap. */}
      <Snackbar
        open={skipSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSkipSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 100 } }}
      >
        {/* role="status" makes this a live region — screen readers will announce
            the message when the snackbar appears, without interrupting the user */}
        <Box role="status" sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 3, py: 1.5, bgcolor: '#E6E0E9',  // dark.inverseSurface
          borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '260px',
        }}>
          <Typography variant="body2" sx={{ color: '#322F35', flex: 1 }}>
            <strong>{skippedGameName}</strong> moved later in the queue
          </Typography>
          <IconButton size="small" aria-label="Dismiss notification" onClick={() => setSkipSnackbarOpen(false)} sx={{ color: '#605D62', p: 0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>

      {/* ── Remove snackbar ───────────────────────────────────────────────── */}
      <Snackbar
        open={removeSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setRemoveSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 100 } }}
      >
        <Box role="status" sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 3, py: 1.5, bgcolor: '#E6E0E9',
          borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '260px',
        }}>
          <Typography variant="body2" sx={{ color: '#322F35', flex: 1 }}>
            <strong>{removedGameName}</strong> removed from playlist
          </Typography>
          <IconButton size="small" aria-label="Dismiss notification" onClick={() => setRemoveSnackbarOpen(false)} sx={{ color: '#605D62', p: 0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>

      {/* ── "End the Night?" confirmation dialog ─────────────────────────── */}
      {/* Two-step confirmation (drawer option → dialog) prevents accidental endings.
          Separate from the drawer so the drawer can close cleanly before the
          dialog opens, avoiding a stacked modal visual glitch. */}
      <Dialog
        open={endNightConfirmOpen}
        onClose={() => setEndNightConfirmOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#2B2930',
            backgroundImage: 'none',
            borderRadius: 3,
            mx: 3,
          },
        }}
      >
        <DialogTitle variant="titleLarge">
          End the Night?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            You'll see a summary of the games you played tonight.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setEndNightConfirmOpen(false)}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          {/* color="error" gives the red destructive button style */}
          <Button
            onClick={() => {
              setEndNightConfirmOpen(false);
              // Fires onEndNight in App.tsx, which sets currentGame = null
              // and screen = "suggestion" → triggers FinishedScreen render.
              onEndNight();
            }}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', borderRadius: 100, px: 2.5 }}
          >
            End the Night
          </Button>
        </DialogActions>
      </Dialog>
    </ScreenLayout>
  );
}