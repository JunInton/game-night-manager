import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { Game } from "../domain/types";

type Props = {
  game: Game;
  onConfirm: () => void;
  onVeto: () => void;
  onRestart: () => void;
};

export default function ConfirmScreen({ game, onConfirm, onVeto, onRestart }: Props) {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Confirm
      </Typography>
      
      <Card sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Do you want to play:
          </Typography>
          <Typography variant="h5" component="h3" gutterBottom>
            {game.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Weight: {game.weight}
          </Typography>
        </CardContent>
      </Card>
      
      <Stack spacing={2}>
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          onClick={onConfirm}
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
        <Button 
          variant="text" 
          fullWidth
          onClick={onRestart}
        >
          Restart
        </Button>
      </Stack>
    </Box>
  );
}