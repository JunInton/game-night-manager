import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

// M3 color tokens used here (dark scheme):
//   Title text:   #6750A4  — light-scheme primary, used as brand accent on dark bg (matches Figma)
//   Button bg:    #E9DDFF  — dark.primaryContainer (the light lavender in Figma)
//   Button text:  #4D3D75  — dark.onPrimaryContainer (the darker purple text on that button)

type Props = {
  onStart: () => void;
};

export default function StartScreen({ onStart }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '100dvh',
        p: 3,
        overflow: 'hidden',
      }}
    >
      {/* Centred title */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Typography
          variant="h1"
          component="h1"
          align="center"
          sx={{
            fontSize: { xs: '80px', sm: '120px' },
            lineHeight: 1,
            // Figma: flat #6750A4 on the dark background — not a gradient
            color: '#6750A4',
            WebkitTextFillColor: '#6750A4',
            background: 'none',
          }}
        >
          GAME NIGHT
          <br />
          MANAGER
        </Typography>


      </Box>

      {/* Buttons area - future Login etc. go here */}
      {/* CTA button
          In Figma the button uses:
            fill = M3/sys/light/primary-container  → #E9DDFF  (light lavender background)
            label = M3/sys/light/on-primary-container → #4D3D75 (darker purple text)
          This is the "filled tonal" button pattern in M3.
      */}

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Button
            size="large"
            startIcon={<AddIcon />}
            onClick={onStart}
            sx={{
              width: '100%',
              maxWidth: 400,
              py: 2,
              borderRadius: 100,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              // Light lavender background matching Figma's primaryContainer
              bgcolor: '#E9DDFF',
              // Dark purple text matching Figma's onPrimaryContainer
              color: '#4D3D75',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#DDD2F8',
                boxShadow: 'none',
              },
              '& .MuiButton-startIcon': {
                color: '#4D3D75',
              },
            }}
          >
            Create game list
          </Button>

          {/* BGG logo */}
          <Box
            component="img"
            src="/powered-by-bgg-reversed-rgb.svg"
            alt="Powered by BoardGameGeek"
            sx={{ height: 28, width: 'auto', opacity: 0.85 }}
            />
        </Box>
    </Box>
  );
}