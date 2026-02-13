import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

export function SecondaryButton({ children, sx, ...props }: ButtonProps) {
  return (
    <Button
      variant="outlined"
      {...props}
      sx={{
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}