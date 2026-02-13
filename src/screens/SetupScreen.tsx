import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Game } from "../domain/types";
import { GameSearchInput } from "../components/GameSearchInput";
import { GameSearchResults } from "../components/GameSearchResults";
import { Header } from "../components/Header";
import { demoGames } from "../domain/demoGames";
import { PrimaryButton } from "../components/PrimaryButton";

type Props = {
  onNext: (games: Game[]) => void;
};

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

  const filteredGames = demoGames
    .filter((game) =>
      game.name.toLowerCase().startsWith(search.toLowerCase()) &&
      !selectedGames.some((selected) => selected.name === game.name)
    )
    .sort((a, b) => a.name.localeCompare(b.name)); // Alphabetize search results

  const displayGames = search ? filteredGames : demoGames
    .filter((game) => !selectedGames.some((selected) => selected.name === game.name))

  // Alphabetize the selected games for display in playlist
  const sortedSelectedGames = [...selectedGames].sort((a, b) => a.name.localeCompare(b.name));

  // Initial state - showing large title and create button
  if (!started) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '100dvh',
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
              fontSize: { xs: '80px', sm: '120px' },
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
        
        <PrimaryButton
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
          }}
          >
          Create game list
        </PrimaryButton>
      </Box>
    );
  }

  // Started state - showing search and games
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header 
        showToggle={true}
        toggleState={showSearchResults}
        onToggle={() => setShowSearchResults(!showSearchResults)}
      />

      {showSearchResults ? (
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <GameSearchInput 
            value={search} 
            onChange={setSearch}
            games={filteredGames}
            onSelect={(game) => {
              setSelectedGames([...selectedGames, game]);
              setLastAddedGame(game);
              setSearch("");
            }}
            renderResults={(games) => (
              <GameSearchResults
                games={games}
                onSelect={(game) => {
                  setSelectedGames([...selectedGames, game]);
                  setLastAddedGame(game);
                  setSearch("");
                }}
              />
            )}
          />
        </Box>
      ) : (
        <Alert severity="info" sx={{ display: 'flex', m: 2, flexShrink: 0, justifyContent: 'center',}}>
          Click the + to add more games
        </Alert>
      )}

      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: !showSearchResults ? 14 : 2 }}>
        {showSearchResults ? (
          <>
            {!search && (
              <>
                <Typography variant="h6" sx={{ my: 2 }}>
                  Browse popular games
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
            )}
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ my: 2 }}>
              Your playlist
            </Typography>
            {sortedSelectedGames.length > 0 ? (
              <List>
                {sortedSelectedGames.map((game) => (
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
                No games selected yet.
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
              width: '65vw',
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
          <PrimaryButton
            size="large"
            onClick={() => onNext(selectedGames)}
            disabled={selectedGames.length === 0}
            sx={{
              width: '100%',
              maxWidth: 400,
              py: 2,
            }}
          >
            Ready to game
          </PrimaryButton>
        </Box>
      )}
    </Box>
  );
}