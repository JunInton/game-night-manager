import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

// ─── M3 colour tokens used here (dark scheme) ─────────────────────────────────
//   Title text:   #6750A4  — light-scheme primary, used as a brand accent on dark bg (matches Figma)
//   Button bg:    #E9DDFF  — dark.primaryContainer (the light lavender in Figma)
//   Button text:  #4D3D75  — dark.onPrimaryContainer (the darker purple text on that button)
//
// Note: #6750A4 is the light-scheme primary, not the dark-scheme one (#CFBDFE).
// It's intentionally used here because the Figma design uses it as the app's
// brand colour for large display text against the dark background.

type Props = {
  onStart: () => void;  // navigates to CreateListScreen
};

export default function StartScreen({ onStart }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // justifyContent: 'space-between' pushes the title to the vertical centre
        // and the CTA buttons to the bottom of the screen.
        justifyContent: 'space-between',
        minHeight: '100dvh',  // dvh = dynamic viewport height; avoids iOS address-bar overlap
        p: 3,
        overflow: 'hidden',
      }}
    >
      {/* ── Title area ──────────────────────────────────────────────────── */}
      {/* flex: 1 makes this section grow to fill the space between the top
          edge and the button row, effectively centering the title vertically. */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Typography
          variant="h1"
          component="h1"
          align="center"
          sx={{
            // Responsive font size: 80px on mobile, 120px on wider screens.
            fontSize: { xs: '80px', sm: '120px' },
            lineHeight: 1,
            // Figma specifies flat #6750A4 (not a gradient) against the dark bg.
            color: '#6750A4',
            // WebkitTextFillColor overrides CSS `color` in WebKit browsers when
            // a gradient background-clip is in effect. Set explicitly to prevent
            // any inherited gradient from the theme bleeding through.
            WebkitTextFillColor: '#6750A4',
            background: 'none',
          }}
        >
          GAME NIGHT
          <br />
          MANAGER
        </Typography>
      </Box>

      {/* ── CTA area ─────────────────────────────────────────────────────── */}
      {/* Future login/sign-up buttons would go here alongside the CTA.
          In Figma the button uses the "filled tonal" M3 pattern:
            fill  = M3/sys/light/primary-container  → #E9DDFF  (light lavender)
            label = M3/sys/light/on-primary-container → #4D3D75 (dark purple)
          This is the same style as PrimaryButton but defined inline here
          because the start screen predates that component. */}
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Button
          size="large"
          startIcon={<AddIcon />}
          onClick={onStart}
          sx={{
            width: '100%',
            maxWidth: 400,
            py: 2,
            borderRadius: 100,       // M3 "Full" pill shape
            textTransform: 'none',   // M3 never uppercases button labels
            fontWeight: 600,
            fontSize: '1rem',
            bgcolor: '#E9DDFF',      // dark.primaryContainer — light lavender
            color: '#4D3D75',        // dark.onPrimaryContainer — dark purple
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#DDD2F8',    // slightly darker on hover
              boxShadow: 'none',
            },
            '& .MuiButton-startIcon': {
              color: '#4D3D75',      // icon inherits the same dark purple
            },
          }}
        >
          Create game list
        </Button>

        {/* BGG attribution logo — required by BoardGameGeek's API terms of use.
            opacity: 0.85 softens it slightly so it doesn't compete with the CTA. */}
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