import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, extendTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'

// ============================================================
// MODULE AUGMENTATION — extends MUI's built-in TypeScript types
// to accept the M3 tokens that don't exist in M2's type definitions.
//
// "Module augmentation" means: open an existing TypeScript module's
// type declarations and add new properties to its interfaces.
// This does NOT change any runtime behavior — it's purely a TypeScript
// instruction that says "these extra properties are valid, stop complaining."
//
// Without this block, TypeScript throws errors like:
//   "tertiary does not exist in type PaletteOptions"
//   "titleLarge does not exist in type TypographyVariantsOptions"
//
// The `declare module '...'` syntax reopens the module's type namespace
// and merges our additions into it. This is the official pattern
// recommended in the MUI docs for extending the theme.
// ============================================================
declare module '@mui/material/styles' {
  // Add `tertiary` to the Palette interface so TypeScript accepts
  // `theme.palette.tertiary` reads anywhere in the app.
  interface Palette {
    tertiary: {
      main: string
      contrastText: string
      light: string
      dark: string
    }
  }
  // PaletteOptions is the shape passed *into* the theme config object.
  // Making it optional (?) means you don't have to provide it.
  interface PaletteOptions {
    tertiary?: {
      main: string
      contrastText: string
      light: string
      dark: string
    }
  }

  // Add `titleLarge` as a custom Typography variant.
  // TypographyVariants is for reading the value; TypographyVariantsOptions is for defining it.
  interface TypographyVariants {
    titleLarge: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    titleLarge?: React.CSSProperties;
  }

  // extendTheme (CSS vars mode) needs to know which named color schemes are valid.
  // By default only "light" is known. Adding "dark: true" here tells TypeScript
  // that `colorSchemes: { dark: { … } }` is an accepted configuration.
  interface ColorSchemeOverrides {
    dark: true
    light: true
  }
}

// Extend MUI Typography's props interface so JSX like
// <Typography variant="titleLarge"> doesn't produce a TypeScript error.
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    titleLarge: true;
  }
}

// ============================================================
// THEME CONFIGURATION
//
// ALL color values come directly from material-theme.json, which was
// exported from m3.material.io/theme-builder (seed colour: #6750A4).
//
// We use extendTheme (CSS vars mode) instead of the older createTheme.
// The key difference: extendTheme generates CSS custom properties
// (e.g. --mui-palette-primary-main) which makes light/dark toggling
// possible without a React re-render. createTheme inlines values.
//
// Token mapping — how M3 JSON keys map to MUI palette slots:
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
  // colorSchemes holds one palette per color scheme.
  // The app defaults to "dark" (see ThemeProvider below).
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: '#CFBDFE',          // dark.primary — light lavender; main interactive color
          contrastText: '#36275D',  // dark.onPrimary — dark purple text on primary bg
          light: '#4D3D75',         // dark.primaryContainer — container bg
          dark: '#E9DDFF',          // dark.onPrimaryContainer — text on container bg
        },
        secondary: {
          main: '#CBC2DB',          // dark.secondary
          contrastText: '#332D41',  // dark.onSecondary
          light: '#4A4458',         // dark.secondaryContainer
          dark: '#E8DEF8',          // dark.onSecondaryContainer
        },
        // Tertiary is a supporting accent colour (pink tones here).
        // Not currently used in components but available for future use.
        tertiary: {
          main: '#EFB8C8',          // dark.tertiary
          contrastText: '#4A2532',  // dark.onTertiary
          light: '#633B48',         // dark.tertiaryContainer
          dark: '#FFD9E3',          // dark.onTertiaryContainer
        },
        error: {
          main: '#FFB4AB',          // dark.error — salmon/coral for destructive actions
          contrastText: '#690005',  // dark.onError
          light: '#93000A',         // dark.errorContainer
          dark: '#FFDAD6',          // dark.onErrorContainer
        },
        background: {
          default: '#141218',       // dark.background / dark.surface — near-black page bg
          paper: '#211F24',         // dark.surfaceContainer — slightly lighter for cards/paper
        },
        text: {
          primary: '#E6E0E9',       // dark.onSurface — off-white body text
          secondary: '#CAC4CF',     // dark.onSurfaceVariant — muted secondary text
        },
        divider: '#49454E',         // dark.outlineVariant — subtle separator lines
      },
    },

    // Light scheme — included for completeness but the app currently always uses dark.
    // If you add a theme toggle later, use the useColorScheme() hook from
    // @mui/material/styles anywhere in the component tree.
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
          default: '#FDF7FF',       // light.background — very light purple-tinted white
          paper: '#F2ECF4',         // light.surfaceContainer
        },
        text: {
          primary: '#1D1B20',       // light.onSurface — near-black
          secondary: '#49454E',     // light.onSurfaceVariant — medium grey
        },
        divider: '#CAC4CF',         // light.outlineVariant
      },
    },
  },

  shape: {
    // M3's base shape unit is "Medium" = 12px corner radius.
    // Individual components override this with their own M3 shape tokens
    // (e.g. buttons use "Full" = 100px, cards use "Large" = 16px).
    borderRadius: 12,
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',

    // h1–h3 and h6 use Road Rage for the bold display / hero text style.
    // h4 and h5 use Roboto (no Road Rage override).
    h1: {
      fontFamily: '"Road Rage", sans-serif',
      fontWeight: 400,
      fontSize: '3.5625rem',   // M3 Display Large
      lineHeight: 1.123,
      letterSpacing: '-0.25px',
    },
    h2: {
      fontFamily: '"Road Rage", sans-serif',
      fontWeight: 400,
      fontSize: '2.8125rem',   // M3 Display Medium
      lineHeight: 1.156,
    },
    h3: {
      fontFamily: '"Road Rage", sans-serif',
      fontWeight: 400,
      fontSize: '2.25rem',     // M3 Display Small
      lineHeight: 1.222,
    },
    h4: {
      fontWeight: 400,
      fontSize: '2rem',        // M3 Headline Large
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 400,
      fontSize: '1.75rem',     // M3 Headline Medium — used for game titles on suggestion/confirm screens
      lineHeight: 1.286,
    },
    h6: {
      fontFamily: '"Road Rage", sans-serif',
      fontWeight: 400,
      fontSize: '1.5rem',      // M3 Headline Small
      lineHeight: 1.333,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: '0.00625em',
      textTransform: 'none',   // M3 never uppercases button labels
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01786em',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.03333em',
    },
    // Custom variant — M3 Title Large, used for section headings, sheet titles,
    // screen labels like "Now Playing" and "Create game list".
    titleLarge: {
      fontSize: '1.375rem',
      lineHeight: '1.75rem',
      fontWeight: 500,
      letterSpacing: '0.009em',
    }
  },

  // ── Component overrides ─────────────────────────────────────────────────────
  // Each entry here overrides MUI's default styles for that component globally.
  // This replaces having to write sx={{ … }} on every single instance.
  components: {

    // ── Button ────────────────────────────────────────────────────────────────
    // M3 shape for buttons: "Full" = borderRadius 100 (fully rounded pill).
    // No drop shadows on any button variant.
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
          // M3 disabled state:
          //   background = onSurface @ 12% opacity
          //   text       = onSurface @ 38% opacity
          '&.Mui-disabled': {
            backgroundColor: 'rgba(230, 224, 233, 0.12)', // dark.onSurface @ 12%
            color: 'rgba(230, 224, 233, 0.38)',            // dark.onSurface @ 38%
          },
        },
        outlined: {
          borderColor: '#948F99',  // dark.outline
          '&:hover': {
            // M3 state layer: primary color at 8% opacity overlaid on hover
            backgroundColor: 'rgba(207, 189, 254, 0.08)', // dark.primary @ 8%
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(230, 224, 233, 0.12)',
            color: 'rgba(230, 224, 233, 0.38)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(207, 189, 254, 0.08)', // dark.primary @ 8%
          },
        },
      },
    },

    // ── Card ──────────────────────────────────────────────────────────────────
    // M3 Filled card. Shape: "Large" = 16px.
    // Uses surfaceContainerLow as the background.
    // M3 uses a subtle primary-tint gradient to express elevation instead of shadows.
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          backgroundColor: '#1D1B20', // dark.surfaceContainerLow
          // Elevation tint: 5% primary overlay simulates M3 elevation level 1
          backgroundImage:
            'linear-gradient(rgba(207, 189, 254, 0.05), rgba(207, 189, 254, 0.05))',
        },
      },
    },

    // ── Paper ─────────────────────────────────────────────────────────────────
    // M3 elevation is expressed via surfaceTint layers (not drop shadows).
    // surfaceTint = dark.primary (#CFBDFE). Higher elevation = stronger tint.
    // elevation1 → 5% tint, elevation2 → 8% tint, elevation8 → 11% tint.
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

    // ── TextField ─────────────────────────────────────────────────────────────
    // M3 shape for search/text input fields: "ExtraLarge" = 28px border radius.
    // Border colours cycle through outline (rest) → onSurface (hover) → primary (focused).
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 28,             // M3 ExtraLarge shape
            '& fieldset': {
              borderColor: '#948F99',     // dark.outline — default border
            },
            '&:hover fieldset': {
              borderColor: '#E6E0E9',     // dark.onSurface — hover border
            },
            '&.Mui-focused fieldset': {
              borderColor: '#CFBDFE',     // dark.primary — focus border
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#CFBDFE',             // dark.primary — floating label when focused
          },
        },
      },
    },

    // ── Chip ──────────────────────────────────────────────────────────────────
    // M3 Assist chip. Shape: 8px (just slightly rounded, not a full pill).
    // Uses surfaceContainerHigh as the background.
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

    // ── AppBar ────────────────────────────────────────────────────────────────
    // M3 Top App Bar: flat, surface color, no elevation shadow.
    // We override MUI's default primary-coloured AppBar with the surface colour.
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#141218',  // dark.surface — matches the page background
          backgroundImage: 'none',
          boxShadow: 'none',
          color: '#E6E0E9',            // dark.onSurface — icons and text
        },
      },
    },

    // ── ToggleButton ──────────────────────────────────────────────────────────
    // Approximates M3 Segmented Button (MUI doesn't have this natively in v5).
    // Selected: secondaryContainer bg + onSecondaryContainer text.
    // Unselected: transparent bg with outline border.
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          textTransform: 'none',
          fontWeight: 500,
          color: '#E6E0E9',             // dark.onSurface — unselected text
          borderColor: '#948F99',       // dark.outline — unselected border
          '&.Mui-selected': {
            backgroundColor: '#4A4458', // dark.secondaryContainer — selected bg
            color: '#E8DEF8',           // dark.onSecondaryContainer — selected text
            borderColor: '#4A4458',     // match the bg so the border disappears
            '&:hover': {
              backgroundColor: '#4A4458',  // keep selected colour on hover
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(207, 189, 254, 0.08)', // dark.primary @ 8% state layer
          },
        },
      },
    },

    // ── ListItemButton ────────────────────────────────────────────────────────
    // Global hover + selected state for all ListItemButton usages (drawer, sheets).
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          '&:hover': {
            backgroundColor: 'rgba(207, 189, 254, 0.08)',  // dark.primary @ 8%
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(207, 189, 254, 0.12)',  // dark.primary @ 12%
          },
        },
      },
    },

    // ── Snackbar ──────────────────────────────────────────────────────────────
    // M3 uses inverseSurface for snackbar backgrounds — it's a near-white color
    // that contrasts well against the near-black page background.
    // Note: the app renders custom Snackbar content (not MuiSnackbarContent),
    // so this override mainly affects any default Snackbar messages.
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#E6E0E9',  // dark.inverseSurface — light background
          color: '#322F35',            // dark.inverseOnSurface — dark text on light bg
          borderRadius: 4,
        },
      },
    },
  },
})

// ── App entry point ────────────────────────────────────────────────────────────
// createRoot mounts the React tree into the #root div in index.html.
// The ! (non-null assertion) tells TypeScript we're certain the element exists.
createRoot(document.getElementById('root')!).render(
  // StrictMode runs each component twice in development to surface side effects.
  // It has no effect in production builds.
  <StrictMode>
    {/*
      ThemeProvider with extendTheme replaces the older createTheme + ThemeProvider combo.
      defaultMode="dark" sets the initial color scheme to dark on first load.

      To add a light/dark toggle later:
        1. Import useColorScheme from @mui/material/styles
        2. Call const { setMode } = useColorScheme() inside any component
        3. Call setMode('light') or setMode('dark') on a button click
      No prop drilling required — the hook reads/writes the CSS vars directly.
    */}
    <ThemeProvider theme={theme} defaultMode="dark">
      {/*
        CssBaseline applies a consistent CSS reset across browsers:
        removes default margins, sets box-sizing: border-box, applies the
        background.default color to <body>, etc.
        Always include it at the root when using MUI.
      */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)