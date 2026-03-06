import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import HomeIcon from '@mui/icons-material/Home';
import { track } from '../analytics';

// ─── Props ────────────────────────────────────────────────────────────────────
// All props are optional — the header renders without a hamburger if neither
// onViewPlaylist nor onMainMenu is provided (e.g. on FinishedScreen).
//
// showToggle / toggleState / onToggle: old toggle button API, currently unused
// by any screen but kept for potential future use.
//
// onViewPlaylist: if provided, "View / Edit Playlist" appears in the side drawer.
//                 Only passed during an active session.
// onMainMenu:     if provided, "Return to Main Menu" appears in the drawer.
//                 Always requires a two-step confirmation before firing.
type Props = {
  showToggle?: boolean;
  toggleState?: boolean;
  onToggle?: () => void;
  // If provided, "View / Edit Playlist" will appear in the menu
  onViewPlaylist?: () => void;
  // Always provided — navigates to the main menu (StartScreen)
  onMainMenu?: () => void;
};

export function Header({
  showToggle = false,
  toggleState,
  onToggle,
  onViewPlaylist,
  onMainMenu,
}: Props) {
  // drawerOpen controls the left-side navigation drawer.
  const [drawerOpen, setDrawerOpen] = useState(false);
  // confirmOpen controls the "Return to Main Menu?" confirmation dialog.
  // We use a separate dialog (rather than a window.confirm) for consistency
  // with the M3 design and to avoid blocking the browser's main thread.
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDrawerOpen = () => {
    track("menu_opened");
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    track("menu_closed", { action: "dismissed" });
    setDrawerOpen(false);
  };

  // Tapping "Return to Main Menu" in the drawer closes the drawer first,
  // then opens the confirmation dialog. This prevents the drawer from
  // remaining open behind the dialog.
  const handleMainMenuClick = () => {
    track("menu_main_menu_tapped");
    setDrawerOpen(false);
    setConfirmOpen(true);
  };

  // User confirmed they want to go to the main menu — fire the callback.
  const handleConfirm = () => {
    setConfirmOpen(false);
    // ?. (optional chaining) — safe to call even if onMainMenu wasn't provided.
    onMainMenu?.();
  };

  // User cancelled — close the dialog without doing anything.
  const handleConfirmCancel = () => {
    track("menu_main_menu_cancelled");
    setConfirmOpen(false);
  };

  const handleViewPlaylist = () => {
    track("menu_view_playlist_tapped");
    setDrawerOpen(false);
    onViewPlaylist?.();
  };

  // Don't render an interactive hamburger if there are no menu actions to show.
  // On screens like FinishedScreen that pass no callbacks, the hamburger is
  // replaced by an invisible placeholder Box so the title stays centred.
  const hasMenuActions = onViewPlaylist || onMainMenu;

  return (
    <>
      {/* ── App bar ──────────────────────────────────────────────────────── */}
      {/* position="static" means the bar scrolls with the page (not fixed).
          elevation={0} removes the default MUI drop shadow.
          backgroundColor is set to transparent so the page background shows through. */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'transparent !important',
          backgroundImage: 'none !important',
          flexShrink: 0,
        }}
      >
        <Toolbar>
          {hasMenuActions ? (
            <IconButton
              edge="start"
              aria-label="open menu"
              onClick={handleDrawerOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            // Invisible placeholder — keeps the title horizontally centred
            // even when there's no hamburger to its left.
            <Box sx={{ width: 40, mr: 2 }} />
          )}

          {/* App title — always visible, Road Rage font, brand purple */}
          <Typography
            variant="h6"
            component="h1"
            sx={{
              flexGrow: 1,
              fontFamily: '"Road Rage", sans-serif',
              fontSize: '1.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6750A4',
              background: 'none',
              // WebkitTextFillColor overrides the CSS `color` property in
              // WebKit-based browsers when a gradient is set. We set it
              // explicitly to the flat colour so no gradient bleeds through.
              WebkitTextFillColor: '#6750A4',
            }}
          >
            Game Night Manager
          </Typography>

          {/* Optional toggle button (currently unused — no screen passes showToggle).
              When toggleState is true the icon is an X (Close); false shows a + (Add). */}
          {showToggle && onToggle && (
            <IconButton
              edge="end"
              onClick={onToggle}
              aria-label={toggleState ? 'Close' : 'Add game'}
            >
              {toggleState ? <CloseIcon /> : <AddIcon />}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* ── Navigation drawer ─────────────────────────────────────────────── */}
      {/* anchor="left" slides in from the left edge, matching standard mobile nav. */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#1C1B1F',    // dark.surfaceContainerLow — slightly darker than page
            backgroundImage: 'none',
          },
        }}
      >
        {/* Drawer header — title + close button */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
        }}>
          <Typography
            sx={{
              fontFamily: '"Road Rage", sans-serif',
              fontSize: '1.4rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6750A4',
            }}
          >
            Game Night Manager
          </Typography>
          <IconButton
            size="small"
            onClick={handleDrawerClose}
            aria-label="close menu"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        <List sx={{ pt: 1 }}>
          {/* "View / Edit Playlist" — only rendered during an active session.
              App.tsx passes onViewPlaylist only from SuggestionScreen and ConfirmScreen. */}
          {onViewPlaylist && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleViewPlaylist}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&:hover': { bgcolor: 'rgba(103,80,164,0.12)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <FormatListBulletedIcon sx={{ color: '#CFBDFE' }} />
                </ListItemIcon>
                <ListItemText
                  primary="View / Edit Playlist"
                  primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          )}

          {/* Divider separates navigation actions from the destructive "go home" action.
              Only shown when both items are present — avoids a floating divider. */}
          {onViewPlaylist && onMainMenu && (
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />
          )}

          {/* "Return to Main Menu" — destructive (resets the whole session).
              Tapping this does NOT immediately fire onMainMenu; it opens the
              confirmation dialog first (see handleMainMenuClick above). */}
          {onMainMenu && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleMainMenuClick}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  // Subtle red tint on hover to signal this is a destructive action.
                  '&:hover': { bgcolor: 'rgba(207,72,72,0.1)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <HomeIcon sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Return to Main Menu"
                  primaryTypographyProps={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: 'error.main',
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>

      {/* ── Confirmation dialog ───────────────────────────────────────────── */}
      {/* Two-step confirmation for the destructive "go home" action.
          This pattern (drawer → dialog) prevents accidental session loss
          while keeping the UI feel native and non-blocking. */}
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmCancel}
        PaperProps={{
          sx: {
            bgcolor: '#2B2930',
            backgroundImage: 'none',
            borderRadius: 3,
            mx: 3,   // horizontal margin so the dialog doesn't touch screen edges
          },
        }}
      >
        <DialogTitle variant="titleLarge">
          Return to Main Menu?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Your current session and playlist will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleConfirmCancel}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          {/* Variant "contained" + color "error" gives the red destructive button. */}
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', borderRadius: 100, px: 2.5 }}
          >
            Return to Main Menu
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}