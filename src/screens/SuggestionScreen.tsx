import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { Game } from "../domain/types";

type Props = {
  game: Game;
  onNext: () => void;
};

export default function SuggestionScreen({ game, onNext }: Props) {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Suggestion
      </Typography>
      <Typography variant="body1" paragraph>
        Here's a suggestion for the next game.
      </Typography>
      
      <Card sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            You should play:
          </Typography>
          <Typography variant="h5" component="h3" gutterBottom>
            {game.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Weight: {game.weight}
          </Typography>
        </CardContent>
      </Card>
      
      <Button 
        variant="contained" 
        fullWidth 
        size="large"
        onClick={onNext}
      >
        Continue
      </Button>
    </Box>
  );
}