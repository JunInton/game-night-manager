import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { Game } from "../domain/types";
import { Header } from "../components/Header";

type Props = {
  game: Game;
  onNext: () => void;
  onRestart: () => void;
};

export default function ConfirmScreen({ game, onNext, onRestart }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header />
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 3, maxWidth: 600, mx: 'auto', width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          Now Playing
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
        
        <Stack spacing={2}>
          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={onNext}
            sx={{
              bgcolor: 'rgba(103, 80, 164, 0.3)',
              color: '#9575CD',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(103, 80, 164, 0.4)',
              }
            }}
          >
            Next game
          </Button>
          
          {/* Add significant spacing before restart button */}
          <Box sx={{ pt: 12 }}>
            <Button 
              variant="text" 
              fullWidth
              onClick={onRestart}
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              Restart from beginning
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}