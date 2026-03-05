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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleMainMenuClick = () => {
    setDrawerOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    onMainMenu?.();
  };

  const handleViewPlaylist = () => {
    setDrawerOpen(false);
    onViewPlaylist?.();
  };

  // Don't render an interactive hamburger if there are no menu actions to show
  const hasMenuActions = onViewPlaylist || onMainMenu;

  return (
    <>
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
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            // Inert placeholder so the title stays visually consistent
            <Box sx={{ width: 40, mr: 2 }} />
          )}

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
              WebkitTextFillColor: '#6750A4',
            }}
          >
            Game Night Manager
          </Typography>

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

      {/* ── Navigation drawer ── */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#1C1B1F',
            backgroundImage: 'none',
          },
        }}
      >
        {/* Drawer header */}
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
            onClick={() => setDrawerOpen(false)}
            aria-label="close menu"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        <List sx={{ pt: 1 }}>
          {/* View / Edit Playlist — only during an active session */}
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

          {/* Divider before the destructive action */}
          {onViewPlaylist && onMainMenu && (
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />
          )}

          {/* Return to Main Menu */}
          {onMainMenu && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleMainMenuClick}
                sx={{
                  borderRadius: 2,
                  mx: 1,
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

      {/* ── Return to Main Menu confirmation dialog ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
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
          Return to Main Menu?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Your current session and playlist will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
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