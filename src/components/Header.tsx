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
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', flexShrink: 0 }}>
      <Toolbar>
        <IconButton
          edge="start"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
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
            background: 'linear-gradient(135deg, #6750A4 0%, #9575CD 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Game Night Manager
        </Typography>
        {showToggle && onToggle && (
          <IconButton
            edge="end"
            onClick={onToggle}
            aria-label={toggleState ? "Hide search results" : "Show search results"}
          >
            {toggleState ? <CloseIcon /> : <AddIcon />}
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
}