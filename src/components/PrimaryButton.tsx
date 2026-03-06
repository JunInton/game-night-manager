import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

// ─── PrimaryButton ────────────────────────────────────────────────────────────
// Implements the Material Design 3 "Filled Tonal" button pattern from the Figma:
//
//   background: primaryContainer  (#E9DDFF — light lavender)
//   text/icon:  onPrimaryContainer (#4D3D75 — dark purple)
//
// "Tonal" means the colour is derived from the primary palette but is not the
// primary colour itself — it's a softer, lower-contrast variant. This is used
// for all primary CTAs in the app: "Create game list", "Ready to game", "Play".
//
// ButtonProps is the full set of MUI Button props. Spreading ...props allows
// callers to pass size, startIcon, onClick, disabled, sx, etc. without us
// needing to redeclare each one. sx is pulled out separately so we can merge
// it with our own styles (via ...sx at the end) rather than having it overwrite them.

export function PrimaryButton({ children, sx, ...props }: ButtonProps) {
  return (
    <Button
      variant="contained"
      {...props}   // passes through size, startIcon, onClick, disabled, etc.
      sx={{
        bgcolor: '#E9DDFF',        // dark.primaryContainer (light lavender bg)
        color: '#4D3D75',          // dark.onPrimaryContainer (dark purple text)
        fontWeight: 600,
        borderRadius: 100,         // M3 "Full" shape — fully rounded pill
        textTransform: 'none',     // M3 never uppercases button labels
        boxShadow: 'none',         // M3 tonal buttons have no elevation shadow
        '&:hover': {
          bgcolor: '#DDD2F8',      // slightly darker lavender on hover
          boxShadow: 'none',
        },
        '&:disabled': {
          // M3 disabled state: onSurface @ 12% bg, onSurface @ 38% text
          bgcolor: 'rgba(233, 221, 255, 0.3)',
          color: 'rgba(77, 61, 117, 0.4)',
        },
        // Spread caller's sx last so they can override any of the above if needed.
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}