import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { Header } from "./Header";

type ScreenLayoutProps = {
  children: ReactNode;
  showHeader?: boolean;
  headerProps?: {
    showToggle?: boolean;
    toggleState?: boolean;
    onToggle?: () => void;
  };
};
export function ScreenLayout({
  children,
  showHeader = true,
  headerProps
}: ScreenLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {showHeader && <Header {...headerProps} />}

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3},
          maxWidth: 600,
          mx: 'auto',
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}