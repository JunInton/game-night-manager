import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import type { Game } from "../domain/types";

type Props = {
  game: Game;
  nextWeight: "light" | "heavy" | null;
  onConfirm: () => void;
  onVeto: () => void;
  onWeightPreferenceChange: (weight: "light" | "heavy" | null) => void;
};

export default function SuggestionScreen({ game, nextWeight, onConfirm, onVeto, onWeightPreferenceChange }: Props) {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
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
          value={nextWeight}
          exclusive
          onChange={(_, value) => onWeightPreferenceChange(value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="light">
            Light
          </ToggleButton>
          <ToggleButton value="heavy">
            Heavy
          </ToggleButton>
          <ToggleButton value={null}>
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
      </Stack>
    </Box>
  );
}