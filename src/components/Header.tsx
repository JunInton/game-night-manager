import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

type Props = {
  showToggle?: boolean;
  toggleState?: boolean;
  onToggle?: () => void;
};

export function Header({ showToggle = false, toggleState, onToggle }: Props) {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        // Override the theme's hardcoded backgroundColor so it stays transparent.
        // We use '!important' because MuiAppBar styleOverrides in the theme
        // have higher specificity than sx props without it.
        backgroundColor: 'transparent !important',
        backgroundImage: 'none !important',
        flexShrink: 0,
      }}
    >
      <Toolbar>
        <IconButton edge="start" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="h1"
          sx={{
            flexGrow: 1,
            fontFamily: '"Road Rage", sans-serif',
            fontSize: '1.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            // Figma uses the light-scheme primary (#6750A4) as a flat colour on
            // the dark background — it's not a gradient.  Match that exactly.
            color: '#6750A4',
            // Clear any inherited gradient clip that may have been set previously
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
  );
}