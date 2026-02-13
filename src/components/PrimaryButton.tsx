import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

export function PrimaryButton({ children, sx, ...props }: ButtonProps) {
  return (
    <Button
      variant="contained"
      {...props}
      sx={{
        bgcolor: 'rgba(103, 80, 164, 0.3)',
        color: '#9575CD',
        fontWeight: 600,
        '&:hover': {
          bgcolor: 'rgba(103, 80, 164, 0.4)',
        },
        '&:disabled': {
          bgcolor: 'rgba(103, 80, 164, 0.1)',
          color: 'rgba(149, 117, 205, 0.4)',
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}    