import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, extendTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'

// ============================================================
// Module augmentation — extends MUI's built-in TypeScript types
// to accept the M3 tokens that don't exist in M2's type definitions.
//
// Without this, TypeScript throws errors like:
//   "tertiary does not exist in type PaletteOptions"
//
// This tells TypeScript: "yes, these extra properties are valid."
// It does NOT change any runtime behavior — it's purely for type safety.
// ============================================================
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: {
      main: string
      contrastText: string
      light: string
      dark: string
    }
  }
  interface PaletteOptions {
    tertiary?: {
      main: string
      contrastText: string
      light: string
      dark: string
    }
  }

  interface TypographyVariants {
    titleLarge: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    titleLarge?: React.CSSProperties;
  }

  // Extend ColorSchemeOverrides so extendTheme accepts 'dark' and 'light'
  // as named color schemes (required when using CSS vars mode)
  interface ColorSchemeOverrides {
    dark: true
    light: true
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    titleLarge: true;
  }
}

// ============================================================
// ALL color values come directly from material-theme.json
// exported from m3.material.io/theme-builder (seed: #6750A4).
//
// Token mapping reference:
//   JSON key                 → M3 token name                  → MUI slot
//   ─────────────────────────────────────────────────────────────────────
//   dark.primary             → sys/color/primary              → palette.primary.main
//   dark.onPrimary           → sys/color/on-primary           → palette.primary.contrastText
//   dark.primaryContainer    → sys/color/primary-container    → palette.primary.light
//   dark.onPrimaryContainer  → sys/color/on-primary-container → palette.primary.dark
//   dark.secondary           → sys/color/secondary            → palette.secondary.main
//   dark.background          → sys/color/background           → palette.background.default
//   dark.surfaceContainer    → sys/color/surface-container    → palette.background.paper
//   dark.onSurface           → sys/color/on-surface           → palette.text.primary
//   dark.onSurfaceVariant    → sys/color/on-surface-variant   → palette.text.secondary
//   dark.outline             → sys/color/outline              → border overrides
//   dark.outlineVariant      → sys/color/outline-variant      → divider
//   dark.surfaceContainerLow → sys/color/surface-container-low→ card background
//   dark.surfaceContainerHigh→ sys/color/surface-container-high→ chip background
//   dark.inverseSurface      → sys/color/inverse-surface      → snackbar background
//   dark.inverseOnSurface    → sys/color/inverse-on-surface   → snackbar text
// ============================================================

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: '#CFBDFE',          // dark.primary
          contrastText: '#36275D',  // dark.onPrimary
          light: '#4D3D75',         // dark.primaryContainer
          dark: '#E9DDFF',          // dark.onPrimaryContainer
        },
        secondary: {
          main: '#CBC2DB',          // dark.secondary
          contrastText: '#332D41',  // dark.onSecondary
          light: '#4A4458',         // dark.secondaryContainer
          dark: '#E8DEF8',          // dark.onSecondaryContainer
        },
        tertiary: {
          main: '#EFB8C8',          // dark.tertiary
          contrastText: '#4A2532',  // dark.onTertiary
          light: '#633B48',         // dark.tertiaryContainer
          dark: '#FFD9E3',          // dark.onTertiaryContainer
        },
        error: {
          main: '#FFB4AB',          // dark.error
          contrastText: '#690005',  // dark.onError
          light: '#93000A',         // dark.errorContainer
          dark: '#FFDAD6',          // dark.onErrorContainer
        },
        background: {
          default: '#141218',       // dark.background / dark.surface
          paper: '#211F24',         // dark.surfaceContainer
        },
        text: {
          primary: '#E6E0E9',       // dark.onSurface
          secondary: '#CAC4CF',     // dark.onSurfaceVariant
        },
        divider: '#49454E',         // dark.outlineVariant
      },
    },

    // Light scheme included for completeness — app defaults to dark.
    // If you add a theme toggle later, these values are ready.
    light: {
      palette: {
        primary: {
          main: '#65558F',          // light.primary
          contrastText: '#FFFFFF',  // light.onPrimary
          light: '#E9DDFF',         // light.primaryContainer
          dark: '#4D3D75',          // light.onPrimaryContainer
        },
        secondary: {
          main: '#625B71',          // light.secondary
          contrastText: '#FFFFFF',  // light.onSecondary
          light: '#E8DEF8',         // light.secondaryContainer
          dark: '#4A4458',          // light.onSecondaryContainer
        },
        tertiary: {
          main: '#7E5260',          // light.tertiary
          contrastText: '#FFFFFF',  // light.onTertiary
          light: '#FFD9E3',         // light.tertiaryContainer
          dark: '#633B48',          // light.onTertiaryContainer
        },
        error: {
          main: '#BA1A1A',          // light.error
          contrastText: '#FFFFFF',  // light.onError
          light: '#FFDAD6',         // light.errorContainer
          dark: '#93000A',          // light.onErrorContainer
        },
        background: {
          default: '#FDF7FF',       // light.background
          paper: '#F2ECF4',         // light.surfaceContainer
        },
        text: {
          primary: '#1D1B20',       // light.onSurface
          secondary: '#49454E',     // light.onSurfaceVariant
        },
        divider: '#CAC4CF',         // light.outlineVariant
      },
    },
  },

  shape: {
    borderRadius: 12, // M3 "Medium" — base unit for the shape scale
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Road Rage", sans-serif',
      fontWeight: 400,
      fontSize: '3.5625rem',
      lineHeight: 1.123,
      letterSpacing: '-0.25px',
    },
    h2: {
      fontFamily: '"Road Rage", sans-serif',
      fontWeight: 400,
      fontSize: '2.8125rem',
      lineHeight: 1.156,
    },
    h3: {
      fontFamily: '"Road Rage", sans-serif',
      fontWeight: 400,
      fontSize: '2.25rem',
      lineHeight: 1.222,
    },
    h4: {
      fontWeight: 400,
      fontSize: '2rem',
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 400,
      fontSize: '1.75rem',
      lineHeight: 1.286,
    },
    h6: {
      fontFamily: '"Road Rage", sans-serif',
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: 1.333,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: '0.00625em',
      textTransform: 'none', // M3 never uppercases button labels
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01786em',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.03333em',
    },
    titleLarge: {
      fontSize: '1.375rem',
      lineHeight: '1.75rem',
      fontWeight: 500,
      letterSpacing: '0.009em',
  }
  },

  components: {
    // ── Button ──────────────────────────────────────────────────────────
    // M3 shape: "Full" (borderRadius: 100). No drop shadows.
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          '&:active': { boxShadow: 'none' },
        },
        contained: {
          // Colors from palette.primary.main + contrastText above.
          // M3 disabled: onSurface @ 12% bg, onSurface @ 38% text.
          '&.Mui-disabled': {
            backgroundColor: 'rgba(230, 224, 233, 0.12)', // dark.onSurface @ 12%
            color: 'rgba(230, 224, 233, 0.38)',            // dark.onSurface @ 38%
          },
        },
        outlined: {
          borderColor: '#948F99',  // dark.outline
          '&:hover': {
            backgroundColor: 'rgba(207, 189, 254, 0.08)', // dark.primary @ 8% state layer
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(230, 224, 233, 0.12)',
            color: 'rgba(230, 224, 233, 0.38)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(207, 189, 254, 0.08)', // dark.primary @ 8% state layer
          },
        },
      },
    },

    // ── Card ────────────────────────────────────────────────────────────
    // M3 Filled card. Shape: "Large" (16px).
    // surfaceContainerLow background. Tint expresses elevation, not shadow.
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          backgroundColor: '#1D1B20', // dark.surfaceContainerLow
          backgroundImage:
            'linear-gradient(rgba(207, 189, 254, 0.05), rgba(207, 189, 254, 0.05))',
        },
      },
    },

    // ── Paper ───────────────────────────────────────────────────────────
    // M3 elevation via surfaceTint layers. surfaceTint = dark.primary (#CFBDFE).
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#211F24', // dark.surfaceContainer
        },
        elevation1: {
          backgroundImage:
            'linear-gradient(rgba(207, 189, 254, 0.05), rgba(207, 189, 254, 0.05))',
          boxShadow: 'none',
        },
        elevation2: {
          backgroundImage:
            'linear-gradient(rgba(207, 189, 254, 0.08), rgba(207, 189, 254, 0.08))',
          boxShadow: 'none',
        },
        elevation8: {
          backgroundImage:
            'linear-gradient(rgba(207, 189, 254, 0.11), rgba(207, 189, 254, 0.11))',
          boxShadow: 'none',
        },
      },
    },

    // ── TextField ───────────────────────────────────────────────────────
    // M3 shape: "ExtraLarge" (28px) for search/input fields.
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 28,
            '& fieldset': {
              borderColor: '#948F99',  // dark.outline
            },
            '&:hover fieldset': {
              borderColor: '#E6E0E9',  // dark.onSurface
            },
            '&.Mui-focused fieldset': {
              borderColor: '#CFBDFE',  // dark.primary
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#CFBDFE',          // dark.primary
          },
        },
      },
    },

    // ── Chip ────────────────────────────────────────────────────────────
    // M3 Assist chip. Shape: 8px. surfaceContainerHigh background.
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#2B292F',  // dark.surfaceContainerHigh
          color: '#E6E0E9',            // dark.onSurface
          borderColor: '#948F99',      // dark.outline
        },
      },
    },

    // ── AppBar ──────────────────────────────────────────────────────────
    // M3 Top App Bar: flat, surface color, no shadow.
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#141218',  // dark.surface
          backgroundImage: 'none',
          boxShadow: 'none',
          color: '#E6E0E9',            // dark.onSurface
        },
      },
    },

    // ── ToggleButton ────────────────────────────────────────────────────
    // Approximates M3 Segmented Button.
    // Selected: secondaryContainer + onSecondaryContainer.
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          textTransform: 'none',
          fontWeight: 500,
          color: '#E6E0E9',             // dark.onSurface
          borderColor: '#948F99',       // dark.outline
          '&.Mui-selected': {
            backgroundColor: '#4A4458', // dark.secondaryContainer
            color: '#E8DEF8',           // dark.onSecondaryContainer
            borderColor: '#4A4458',
            '&:hover': {
              backgroundColor: '#4A4458',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(207, 189, 254, 0.08)', // dark.primary @ 8%
          },
        },
      },
    },

    // ── ListItemButton ──────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          '&:hover': {
            backgroundColor: 'rgba(207, 189, 254, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(207, 189, 254, 0.12)',
          },
        },
      },
    },

    // ── Snackbar ────────────────────────────────────────────────────────
    // M3 uses inverseSurface for contrast against the dark page background.
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#E6E0E9',  // dark.inverseSurface
          color: '#322F35',            // dark.inverseOnSurface
          borderRadius: 4,
        },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*
      ThemeProvider with extendTheme replaces the old createTheme + ThemeProvider combo.
      defaultMode="dark" sets the initial color scheme to match your designer's intent.
      To add a light/dark toggle later, use the useColorScheme() hook from
      @mui/material/styles anywhere in the component tree.
    */}
    <ThemeProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)