import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { Header } from "./Header";

// ─── ScreenLayoutProps ────────────────────────────────────────────────────────
// children    – the screen's content, rendered inside the scrollable body area
// showHeader  – defaults to true; pass false on screens that manage their own
//               header (e.g. FinishedScreen renders <Header /> directly)
// headerProps – forwarded as-is to <Header />. All fields are optional because
//               Header itself treats every prop as optional — screens that don't
//               need the hamburger menu simply omit onViewPlaylist / onMainMenu.
type ScreenLayoutProps = {
  children: ReactNode;
  showHeader?: boolean;
  headerProps?: {
    showToggle?: boolean;
    toggleState?: boolean;
    onToggle?: () => void;
    onViewPlaylist?: () => void;
    onMainMenu?: () => void;
  };
};

// ─── ScreenLayout ─────────────────────────────────────────────────────────────
// Shared chrome used by SuggestionScreen and ConfirmScreen.
// Provides a full-height column with:
//   • an optional Header pinned at the top (flexShrink: 0 inside Header)
//   • a scrollable content area that fills the remaining height (flex: 1)
//
// The outer Box is intentionally NOT scrollable (overflow: hidden) — only the
// inner Box scrolls. This keeps the Header stationary while long content scrolls
// beneath it, matching standard mobile app behaviour.
//
// Note: screens that use a fixed bottom button row (SuggestionScreen, ConfirmScreen)
// add their own <Box sx={{ height: 160 }} /> spacer as the last child so content
// doesn't scroll under the fixed buttons. ScreenLayout itself doesn't know about
// those buttons and doesn't add that spacer.
export function ScreenLayout({
  children,
  showHeader = true,
  headerProps
}: ScreenLayoutProps) {
  return (
    // Full-height column container. overflow: hidden prevents a second scrollbar
    // from appearing on the outer element while the inner Box scrolls.
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        // On mobile, 100dvh includes the address bar which can cause unwanted overflow when it appears/disappears. Using 100dvh (dynamic viewport height) instead ensures the layout adapts to the actual visible height, preventing overflow issues on iOS Safari.
        overflow: 'hidden',
      }}
    >
      {/* Spread headerProps so individual callbacks (onViewPlaylist, onMainMenu, etc.)
          land directly on Header's props. If headerProps is undefined, Header
          receives no props and renders without a hamburger menu. */}
      {showHeader && <Header {...headerProps} />}

      {/* Scrollable body — flex: 1 makes it fill all remaining height after the Header.
          p: { xs: 2, sm: 3 } = 16px padding on mobile, 24px on wider screens.
          maxWidth: 600 + mx: auto centres content on very wide screens, though in
          practice the app-frame in index.css already caps width at 480px. */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
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