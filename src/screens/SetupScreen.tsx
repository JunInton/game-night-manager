import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import type { Game } from "../domain/types";
import { GameSearchInput } from "../components/GameSearchInput";
import { GameSearchResults } from "../components/GameSearchResults";

type Props = {
  onNext: (games: Game[]) => void;
};

const demoGames: Game[] = [
  { name: "Roll For It", weight: "light" },
  { name: "Gloomhaven", weight: "heavy" },
  { name: "Spirit Island", weight: "heavy" },
  { name: "Qwixx", weight: "light" },
  { name: "Camel Up", weight: "heavy" },
  { name: "Veiled Fate", weight: "heavy" },
  { name: "Incan Gold", weight: "light" },
  { name: "Flip 7", weight: "light" },
  { name: "Azul", weight: "heavy" },
  { name: "Codenames", weight: "light" },
  { name: "Wingspan", weight: "heavy" },
  { name: "Pandemic", weight: "heavy" },
  { name: "Sushi Go!", weight: "light" },
  { name: "Ticket to Ride", weight: "light" },
  { name: "Carcassonne", weight: "light" },
  { name: "7 Wonders", weight: "heavy" },
  { name: "Dominion", weight: "heavy" },
  { name: "Splendor", weight: "light" },
  { name: "Betrayal at House on the Hill", weight: "heavy" },
  { name: "Castle Panic", weight: "light" },
  { name: "Dixit", weight: "light" },
  { name: "Everdell", weight: "heavy" },
  { name: "Flamecraft", weight: "light" },
  { name: "Hanabi", weight: "light" },
  { name: "Kingdomino", weight: "light" },
  { name: "Mysterium", weight: "heavy" },
  { name: "Photosynthesis", weight: "heavy" },
  { name: "Namiji", weight: "light" },
  { name: "Pandante", weight: "light" },
  { name: "Quacks of Quedlinburg", weight: "heavy" },
  { name: "Set a Watch", weight: "light" },
  { name: "Space Base", weight: "light" },
  { name: "Tiny Epic Galaxies", weight: "light" },
  { name: "Roll for the Galaxy", weight: "heavy" },
  { name: "Tsuro", weight: "light" },
  { name: "Zombicide", weight: "heavy" },
];

export default function SetupScreen({ onNext }: Props) {
  const [started, setStarted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(true);
  const [lastAddedGame, setLastAddedGame] = useState<Game | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Auto-close snackbar after 3 seconds, resets timer on new game
  useEffect(() => {
    if (lastAddedGame) {
      setSnackbarOpen(true);
      const timer = setTimeout(() => {
        setSnackbarOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedGame]);

  const filteredGames = demoGames.filter((game) =>
    game.name.toLowerCase().startsWith(search.toLowerCase()) &&
    !selectedGames.some((selected) => selected.name === game.name)
  );

  const displayGames = search ? filteredGames : demoGames.filter(
    (game) => !selectedGames.some((selected) => selected.name === game.name)
  );

  // Initial state - showing large title and create button
  if (!started) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100vh',
          p: 3,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography 
            variant="h1" 
            component="h1" 
            align="center"
            sx={{
              fontSize: { xs: '60px', sm: '80px' },
              background: 'linear-gradient(135deg, #6750A4 0%, #9575CD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            GAME NIGHT
            <br />
            MANAGER
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          size="large"
          startIcon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
            </svg>
          }
          onClick={() => setStarted(true)}
          sx={{ 
            width: '100%',
            maxWidth: 400,
            py: 2,
            mb: 4,
            bgcolor: 'rgba(103, 80, 164, 0.3)',
            color: '#9575CD',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(103, 80, 164, 0.4)',
            }
          }}
        >
          Create game list
        </Button>
      </Box>
    );
  }

  // Started state - showing search and games
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent' }}>
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
              fontSize: '1.5rem', 
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
          <IconButton
            edge="end"
            onClick={() => setShowSearchResults(!showSearchResults)}
            aria-label={showSearchResults ? "Hide search results" : "Show search results"}
          >
            {showSearchResults ? <CloseIcon /> : <AddIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {showSearchResults ? (
        <Box sx={{ p: 2 }}>
          <GameSearchInput value={search} onChange={setSearch} />
        </Box>
      ) : (
        <Alert severity="info" sx={{ m: 2 }}>
          Click the + to add more games
        </Alert>
      )}

      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 12 }}>
        {showSearchResults ? (
          <>
            <Typography variant="h6" sx={{ my: 2 }}>
              {search ? "Search Results" : "Browse popular games"}
            </Typography>

            {displayGames.length > 0 ? (
              <GameSearchResults
                games={displayGames}
                onSelect={(game) => {
                  setSelectedGames([...selectedGames, game]);
                  setLastAddedGame(game);
                  setSearch("");
                }}
              />
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 5 }}>
                No games found
              </Typography>
            )}
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ my: 2 }}>
              Your playlist
            </Typography>
            {selectedGames.length > 0 ? (
              <List>
                {selectedGames.map((game) => (
                  <ListItem
                    key={game.name}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={`Remove ${game.name}`}
                        onClick={() => {
                          setSelectedGames(selectedGames.filter(g => g.name !== game.name));
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{
                      bgcolor: 'background.paper',
                      mb: 1,
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemText
                      primary={game.name}
                      secondary={<Chip label={game.weight} size="small" sx={{ mt: 0.5 }} />}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 5 }}>
                No games selected yet. Click the + to add games.
              </Typography>
            )}
          </>
        )}
      </Box>

      {showSearchResults && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ bottom: { xs: 24, sm: 24 } }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 3,
              py: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              color: '#000',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Typography variant="body1" sx={{ color: '#000' }}>
              {lastAddedGame?.name} is added to game list.
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setSnackbarOpen(false)}
              sx={{ color: '#666' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Snackbar>
      )}

      {!showSearchResults && (
        <Box sx={{ 
          p: 2, 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => onNext(selectedGames)}
            disabled={selectedGames.length === 0}
            sx={{
              width: '100%',
              maxWidth: 400,
              py: 2,
              bgcolor: 'rgba(103, 80, 164, 0.3)',
              color: '#9575CD',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(103, 80, 164, 0.4)',
              },
              '&:disabled': {
                bgcolor: 'rgba(103, 80, 164, 0.1)',
                color: 'rgba(149, 117, 205, 0.4)',
              }
            }}
          >
            Ready to game
          </Button>
        </Box>
      )}
    </Box>
  );
}