import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import type { Game } from "../domain/types";
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { ScreenLayout } from '../components/ScreenLayout';

type Props = {
  vetoedGames: Game[];
  onRestart: () => void;
  onReplayVetoed: () => void;
};

export default function NoResultsScreen({ vetoedGames, onRestart, onReplayVetoed }: Props) {
  // Sort vetoed games alphabetically
  const sortedVetoedGames = [...vetoedGames].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ScreenLayout>
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
          
          <PrimaryButton 
            size="large"
            fullWidth
            onClick={onReplayVetoed}
          >
            Play vetoed games
          </PrimaryButton>
        </>
      )}

      <Box sx={{ pt: 4 }}>
        <SecondaryButton 
          size="large"
          fullWidth
          onClick={onRestart}
        >
          Start over
        </SecondaryButton>
      </Box>
    </ScreenLayout>
  );
}