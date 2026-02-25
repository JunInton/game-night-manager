/**
 * Shared style constants for game cards components displaying game information
 * 
 * Used in:
 * - SuggestionScreen (showing current game suggestion)
 * - ConfirmScreen (showing game that was just played)
 */
export const gameCardSx = {
  my: 3, // Margin top and bottom
  // Can add more shared card styles here in the future
  // Example: boxShadow, border, borderRadius, etc.
} as const;

/**
 * Typography props for game titles (the game name)
 * 
 * Usage: <Typography {...gameTitleProps}>{game.name}</Typography>
 * 
 * Note: Using a props object instead of sx because it includes
 * non-style props like 'component', 'variant', 'gutterBottom'
 */
export const gameTitleProps = {
  variant: "h5" as const,
  component: "h3" as const,  // h5 styling but h3 semantically for accessibility
  gutterBottom: true,
  align: "center" as const,
} as const;

/**
 * Typography props for game weight/metadata
 * 
 * Usage: <Typography {...gameMetaProps}>Weight: {game.weight}</Typography>
 */
export const gameMetaProps = {
  variant: "body2" as const,
  color: "text.secondary" as const,
  align: "center" as const,
} as const;

/**
 * How to use these constants:
 * 
 * BEFORE:
 * <Card sx={{ my: 3 }}>
 *   <CardContent>
 *     <Typography variant="h5" component="h3" gutterBottom align="center">
 *       {game.name}
 *     </Typography>
 *     <Typography variant="body2" color="text.secondary" align="center">
 *       Weight: {game.weight}
 *     </Typography>
 *   </CardContent>
 * </Card>
 * 
 * AFTER:
 * <Card sx={gameCardSx}>
 *   <CardContent>
 *     <Typography {...gameTitleProps}>
 *       {game.name}
 *     </Typography>
 *     <Typography {...gameMetaProps}>
 *       Weight: {game.weight}
 *     </Typography>
 *   </CardContent>
 * </Card>
 * 
 * You can still override individual properties if needed:
 * <Typography {...gameTitleProps} color="primary">
 *   {game.name}
 * </Typography>
 */