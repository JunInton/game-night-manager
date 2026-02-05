import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import type { Game } from "../domain/types";

type Props = {
  vetoedGames: Game[];
  onRestart: () => void;
  onReplayVetoed: () => void;
};

export default function NoResultsScreen({ vetoedGames, onRestart, onReplayVetoed }: Props) {
  // Sort vetoed games alphabetically
  const sortedVetoedGames = [...vetoedGames].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        No more games left
      </Typography>
      
      {vetoedGames.length > 0 && (
        <>
          <Typography variant="body1" paragraph sx={{ mt: 3, mb: 2 }}>
            Vetoed games:
          </Typography>
          <List sx={{ mb: 3 }}>
            {sortedVetoedGames.map((game) => (
              <ListItem
                key={game.name}
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
          
          <Button 
            variant="contained" 
            size="large"
            fullWidth
            onClick={onReplayVetoed}
            sx={{ 
              mb: 2,
              bgcolor: 'rgba(103, 80, 164, 0.3)',
              color: '#9575CD',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(103, 80, 164, 0.4)',
              }
            }}
          >
            Play vetoed games
          </Button>
        </>
      )}
      
      <Button 
        variant="outlined" 
        size="large"
        fullWidth
        onClick={onRestart}
      >
        Start over
      </Button>
    </Box>
  );
}