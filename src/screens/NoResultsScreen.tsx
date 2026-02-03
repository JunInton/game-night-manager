import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

type Props = {
  onRestart: () => void;
};

export default function NoResultsScreen({ onRestart }: Props) {
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        No more games left
      </Typography>
      <Typography variant="body1" paragraph>
        Vetoed games:
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        onClick={onRestart}
      >
        Start over
      </Button>
    </Box>
  );
}