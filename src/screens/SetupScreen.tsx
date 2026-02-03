import { useState } from "react";
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
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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

  const filteredGames = demoGames.filter((game) =>
    game.name.toLowerCase().startsWith(search.toLowerCase()) &&
    !selectedGames.some((selected) => selected.name === game.name)
  );

  const displayGames = search ? filteredGames : demoGames.filter(
    (game) => !selectedGames.some((selected) => selected.name === game.name)
  );

  // Initial state - just showing "Create your game night list" button
  if (!started) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        p: 3,
        gap: 4,
      }}>
        <Typography variant='h3' component='h1' align='center'>
          Board Game Playlist
        </Typography>
        <Button
          variant='contained'
          size='large'
          onClick={() => setStarted(true)}
          sx={{ maxWidth: 320, width: '100%'}}
        >
          Create your game night list
        </Button>
      </Box>
    );
  }

  // Started state - showing search and games
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Board Game Playlist
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
              {search ? "Search Results" : "Most popular games"}
            </Typography>

            {displayGames.length > 0 ? (
              <GameSearchResults
                games={displayGames}
                onSelect={(game) => {
                  setSelectedGames([...selectedGames, game]);
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

      {showSearchResults && selectedGames.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <Chip
            label={`${selectedGames.length} game${selectedGames.length !== 1 ? 's' : ''} selected`}
            color="primary"
            sx={{ px: 2, py: 2.5 }}
          />
        </Box>
      )}

      {!showSearchResults && (
        <Box sx={{ p: 2, position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: 'background.default' }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => onNext(selectedGames)}
            disabled={selectedGames.length === 0}
          >
            Ready to game
          </Button>
        </Box>
      )}
    </Box>
  );
}



  // return (
  //   <div className="setup-screen">
  //     <div className="setup-header">
  //       <button className="close-button">x</button>
  //       <h1 className="setup-title">Board Game Playlist</h1>
  //     </div>

  //     <div className="search-container">
  //       <GameSearchInput value={search} onChange={setSearch} />
  //     </div>

  //     <div className="games-section">
  //       <h2 className="section-title">
  //         {search ? "Search Results" : "Most popular games"}
  //       </h2>

  //       {displayGames.length > 0 ? (
  //         <GameSearchResults
  //           games={displayGames}
  //           onSelect={(game) => {
  //             setSelectedGames([...selectedGames, game]);
  //             setSearch("");
  //           }}
  //         />
  //       ) : (
  //         <p className="no-results"> No games found</p>
  //       )}
  //     </div>

  //     {selectedGames.length > 0 && (
  //       <div className="selected-count">
  //         {selectedGames.length} game{selectedGames.length !== 1 ? 's' : ''} selected
  //       </div>
  //     )}

  //     <button
  //       className="create-button"
  //       onClick={() => onNext(selectedGames)}
  //       disabled={selectedGames.length === 0}
  //     >
  //       Create your game night list
  //     </button>
  //   </div>
  // )






  // return (
  //   <>
  //     <h2>Setup</h2>
  //     <p>Enter games and session constraints.</p>

  //     <GameSearchInput value={search} onChange={setSearch} />

  //     {search && filteredGames.length > 0 && (
  //       <GameSearchResults
  //         games={filteredGames}
  //         onSelect={(game) => {
  //           setSelectedGames([...selectedGames, game]);
  //           setSearch("");
  //         }}
  //       />
  //     )}

  //     {selectedGames.length > 0 && (
  //       <>
  //         <h3>Selected games</h3>
  //         <ul>
  //           {selectedGames.map((game) => (
  //             <li key={game.name}>
  //               {game.name} ({game.weight})
  //             </li>
  //           ))}
  //         </ul>

  //         <button onClick={() => onNext(selectedGames)}>Use selected games</button>
  //       </>
  //     )}

  //   </>
  // )