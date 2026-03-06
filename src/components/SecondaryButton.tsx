import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

// ─── SecondaryButton ──────────────────────────────────────────────────────────
// A thin wrapper around MUI's outlined Button variant.
// variant="outlined" maps loosely to the M3 "Outlined" button pattern —
// transparent background with a visible border, used for secondary actions
// that sit alongside a primary CTA.
//
// All styling currently comes from the global MuiButton styleOverrides in
// main.tsx (borderRadius: 100, no text-transform, dark.outline border colour).
// The sx prop is spread first (before MUI's own styles would apply), so callers
// can still override anything they need to.
//
// Note: this component is currently lightly used — most secondary actions in the
// app use inline Button elements. It's here as a consistent abstraction for future use.

export function SecondaryButton({ children, sx, ...props }: ButtonProps) {
  return (
    <Button
      variant="outlined"
      {...props}
      sx={{
        ...sx,  // caller overrides merged in; global theme handles the rest
      }}
    >
      {children}
    </Button>
  );
}