import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import type { Game } from "../domain/types";
import { Header } from "../components/Header";

type Props = {
  game: Game;
  allGames: Game[]; // NEW: All remaining games in the playlist
  nextWeight: "light" | "heavy" | null;
  onConfirm: () => void;
  onVeto: () => void;
  onWeightPreferenceChange: (weight: "light" | "heavy" | null) => void;
  onOverride: (selectedGame: Game) => void; // NEW: Handler for override selection
};

export default function SuggestionScreen({ 
  game, 
  allGames, 
  nextWeight, 
  onConfirm, 
  onVeto, 
  onWeightPreferenceChange,
  onOverride 
}: Props) {
  const [showOverride, setShowOverride] = useState(false);

  // Filter out the currently suggested game from the override options
  const otherGames = allGames.filter(g => g.name !== game.name);

  const handleOverrideSelect = (selectedGame: Game) => {
    onOverride(selectedGame);
    setShowOverride(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <Header />
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 3, maxWidth: 600, mx: 'auto', width: '100%' }}>
      <Typography variant="h4" gutterBottom align="center">
        Next Game
      </Typography>
      
      <Card sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h3" gutterBottom align="center">
            {game.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Weight: {game.weight}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom align="center">
          Next game preference:
        </Typography>
        <ToggleButtonGroup
          value={nextWeight ?? "auto"}
          exclusive
          onChange={(_, value) => onWeightPreferenceChange(value === "auto" ? null : value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="light">
            Light
          </ToggleButton>
          <ToggleButton value="heavy">
            Heavy
          </ToggleButton>
          <ToggleButton value={"auto"}>
            Auto
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          {nextWeight === null 
            ? "Auto will alternate between light and heavy" 
            : `Next suggestion will be a ${nextWeight} game`}
        </Typography>
      </Box>
      
      <Stack spacing={2}>
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          onClick={onConfirm}
          sx={{
            bgcolor: 'rgba(103, 80, 164, 0.3)',
            color: '#9575CD',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(103, 80, 164, 0.4)',
            }
          }}
        >
          Play this
        </Button>
        <Button 
          variant="outlined" 
          fullWidth 
          size="large"
          onClick={onVeto}
        >
          Nope
        </Button>

        {/* NEW: Override functionality */}
        {otherGames.length > 0 && (
          <>
            <Button
              variant="text"
              fullWidth
              size="medium"
              startIcon={<SwapVertIcon />}
              onClick={() => setShowOverride(!showOverride)}
              sx={{ mt: 2 }}
            >
              {showOverride ? 'Hide other games' : 'Choose a different game'}
            </Button>

            <Collapse in={showOverride}>
              <Card sx={{ bgcolor: 'background.paper', mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Select a different game from your playlist:
                  </Typography>
                  <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {otherGames.map((otherGame) => (
                      <ListItem key={otherGame.name} disablePadding>
                        <ListItemButton
                          onClick={() => handleOverrideSelect(otherGame)}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            '&:hover': {
                              bgcolor: 'rgba(103, 80, 164, 0.1)',
                            }
                          }}
                        >
                          <ListItemText
                            primary={otherGame.name}
                            secondary={
                              <Chip 
                                label={otherGame.weight} 
                                size="small" 
                                sx={{ mt: 0.5 }}
                              />
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Collapse>
          </>
        )}
      </Stack>
      </Box>
    </Box>
  );
}