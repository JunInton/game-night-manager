import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

// M3 "Filled Tonal" button pattern — matches Figma design:
//   background: primaryContainer  (#E9DDFF — light lavender)
//   text/icon:  onPrimaryContainer (#4D3D75 — dark purple)
//
// This is used for all primary CTAs: "Create game list", "Ready to game", "Play"

export function PrimaryButton({ children, sx, ...props }: ButtonProps) {
  return (
    <Button
      variant="contained"
      {...props}
      sx={{
        bgcolor: '#E9DDFF',
        color: '#4D3D75',
        fontWeight: 600,
        borderRadius: 100,
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          bgcolor: '#DDD2F8',
          boxShadow: 'none',
        },
        '&:disabled': {
          bgcolor: 'rgba(233, 221, 255, 0.3)',
          color: 'rgba(77, 61, 117, 0.4)',
        },
        // Allow callers to override any of the above
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}