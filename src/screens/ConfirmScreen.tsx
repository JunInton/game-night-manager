import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { Game } from "../domain/types";
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { gameCardSx, gameTitleProps, gameMetaProps } from "../components/sharedStyles"


type Props = {
  game: Game;
  onNext: () => void;
  onRestart: () => void;
};

export default function ConfirmScreen({ game, onNext, onRestart }: Props) {
  return (
    <ScreenLayout>      
        <Typography variant="h4" gutterBottom align="center">
          Now Playing
        </Typography>
        
        <Card sx={gameCardSx}>
          <CardContent>
            <Typography {...gameTitleProps}>
              {game.name}
            </Typography>
            <Typography {...gameMetaProps}>
              Weight: {game.weight}
            </Typography>
          </CardContent>
        </Card>
        
        <Stack spacing={2}>
          <PrimaryButton 
            fullWidth 
            size="large"
            onClick={onNext}
          >
            Next game
          </PrimaryButton>
          
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
    </ScreenLayout>
  );
}