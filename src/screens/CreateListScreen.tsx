import { useState, useEffect, useRef } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import type { Game } from "../domain/types";
import { PrimaryButton } from "../components/PrimaryButton";
import { GameSearchInput } from "../components/GameSearchInput";
import { GameSearchResults } from "../components/GameSearchResults";
import { searchBGG, getGameDetails, getMultipleGameDetails, getHotGames } from "../services/bggApi";

type Props = {
  selectedGames: Game[];
  onGamesChange: (games: Game[]) => void;
  onViewPlaylist: () => void;
};

type SearchState = "idle" | "searching" | "fetching_details" | "done" | "no_results";

// How many skeleton rows to show while searching
const LOADER_COUNT = 6;

// How many top results to batch-fetch full details for
const BATCH_FETCH_COUNT = 20;

export default function CreateListScreen({ selectedGames, onGamesChange, onViewPlaylist }: Props) {
  const [search, setSearch] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [displayGames, setDisplayGames] = useState<Game[]>([]);
  const [lastAddedGame, setLastAddedGame] = useState<Game | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [hotGames, setHotGames] = useState<Game[]>([]);
  const [hotGamesLoading, setHotGamesLoading] = useState(true);

  const searchIdRef = useRef(0);

  // Load the BGG "hot" list once on mount so we have something to browse
  // even before the user types anything.
  useEffect(() => {
    let cancelled = false;
    const loadHotGames = async () => {
      setHotGamesLoading(true);
      try {
        const hotList = await getHotGames();
        if (cancelled) return;

        // Batch-fetch full details (weight, thumbnail, play time) for the top 20.
        const top20Ids = hotList.slice(0, 20).map(g => g.id);
        const details = await getMultipleGameDetails(top20Ids);
        if (cancelled) return;

        setHotGames(details.map(d => ({
          name: d.name || 'Unknown Game',
          weight: d.weight,
          bggId: d.id ?? undefined,
          imageUrl: d.imageUrl || d.thumbnailUrl || undefined,
          thumbnailUrl: d.thumbnailUrl || undefined,
          playingTime: d.playingTime,
        })));
      } catch (e) {
        console.error('Failed to load hot games:', e);
      } finally {
        if (!cancelled) setHotGamesLoading(false);
      }
    };
    loadHotGames();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!lastAddedGame) return;
    setSnackbarOpen(true);
    const t = setTimeout(() => setSnackbarOpen(false), 3000);
    return () => clearTimeout(t);
  }, [lastAddedGame]);

  useEffect(() => {
    if (search.length < 3) {
      setDisplayGames([]);
      setSearchState("idle");
      return;
    }

    const id = ++searchIdRef.current;
    // Show skeletons immediately — before the debounce fires
    setSearchState("searching");

    const t = setTimeout(async () => {
      try {
        const results = await searchBGG(search);
        if (id !== searchIdRef.current) return;

        if (results.length === 0) {
          setDisplayGames([]);
          setSearchState("no_results");
          return;
        }

        const top = results.slice(0, BATCH_FETCH_COUNT);
        const rest = results.slice(BATCH_FETCH_COUNT);
        const topIds = top.map(r => r.id).filter(Boolean) as string[];

        if (topIds.length > 0) {
          const details = await getMultipleGameDetails(topIds);
          if (id !== searchIdRef.current) return;

          setDisplayGames([
            ...details.map(d => ({
              name: d.name || 'Unknown Game',
              weight: d.weight,
              bggId: d.id ?? undefined,
              imageUrl: d.imageUrl || d.thumbnailUrl || undefined,
              thumbnailUrl: d.thumbnailUrl || undefined,
              playingTime: d.playingTime,
            })),
            ...rest.map(r => ({
              name: r.name || 'Unknown Game',
              weight: 'light' as const,
              bggId: r.id ?? undefined,
            })),
          ]);
        }

        setSearchState("done");
      } catch (e) {
        if (id !== searchIdRef.current) return;
        console.error('Search error:', e);
        setDisplayGames([]);
        setSearchState("no_results");
      }
    }, 500);

    return () => clearTimeout(t);
  }, [search]);

  const handleGameSelect = async (selected: Game) => {
    if (selectedGames.some(g => g.name === selected.name)) return;

    if (selected.imageUrl && selected.weight) {
      onGamesChange([...selectedGames, selected]);
      setLastAddedGame(selected);
      setSearch("");
      setDisplayGames([]);
      setSearchState("idle");
      return;
    }

    setSearchState("fetching_details");
    try {
      const details = await getGameDetails(selected.bggId!);
      const game: Game = {
        name: details.name,
        weight: details.weight,
        bggId: details.id,
        imageUrl: details.imageUrl || details.thumbnailUrl,
        thumbnailUrl: details.thumbnailUrl,
        playingTime: details.playingTime,
      };
      onGamesChange([...selectedGames, game]);
      setLastAddedGame(game);
      setSearch("");
      setDisplayGames([]);
      setSearchState("idle");
    } catch (e) {
      console.error("Error fetching game details:", e);
      setSearchState("done");
    }
  };

  const showResults = search.length >= 3;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>

      {/* ── Top bar ──
          Typography token: M3/body/large-emphasized
            - fontFamily: Roboto (system body font, not Road Rage)
            - fontSize: 1rem (16px = body/large)
            - fontWeight: 500 (emphasized = medium weight in M3)
            - color: text.primary (white on dark background)
            - NOT purple — Figma shows this as white/on-surface text
      ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: 2,
        flexShrink: 0,
      }}>
        <Typography
          component="h1"
          align="center"
          variant="titleLarge"
          // sx={{
          //   fontFamily: 'inherit',
          //   fontSize: '1rem',
          //   fontWeight: 500,
          //   letterSpacing: '0.009em',
          //   color: 'text.primary',
          //   WebkitTextFillColor: 'unset',
          //   background: 'none',
          // }}
        >
          Create game list
        </Typography>
      </Box>

      {/* ── Search field — standalone, no dropdown ── */}
      <Box sx={{ px: 2, pt: 1.5, pb: 2, flexShrink: 0 }}>
        <GameSearchInput
          value={search}
          onChange={setSearch}
          games={[]}
          onSelect={() => {}}
          renderResults={() => null}
        />
      </Box>

      {/* ── Results area ── */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 14 }}>

        {/* Skeletons */}
        {showResults && searchState === "searching" && (
          <Box sx={{ mt: 1 }}>
            {Array.from({ length: LOADER_COUNT }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="68%" height={24} />
                  <Skeleton variant="text" width="32%" height={20} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton variant="circular" width={36} height={36} />
              </Box>
            ))}
          </Box>
        )}

        {/* Fetching details skeleton */}
        {searchState === "fetching_details" && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
            <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        )}

        {/* Search results — already-selected games are filtered out */}
        {showResults && searchState === "done" && displayGames.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <GameSearchResults
              games={displayGames.filter(g => !selectedGames.some(s => s.name === g.name))}
              onSelect={handleGameSelect}
            />
          </Box>
        )}

        {/* No results */}
        {showResults && searchState === "no_results" && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No games found for "{search}"
          </Typography>
        )}

        {/* Idle state — show hot/popular games from BGG */}
        {!showResults && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
              Browse popular games
            </Typography>

            {hotGamesLoading ? (
              // Skeletons while hot list loads
              Array.from({ length: LOADER_COUNT }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                  <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1, flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="68%" height={24} />
                    <Skeleton variant="text" width="32%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                  <Skeleton variant="circular" width={36} height={36} />
                </Box>
              ))
            ) : hotGames.length > 0 ? (
              <GameSearchResults
                games={hotGames.filter(g => !selectedGames.some(s => s.name === g.name))}
                onSelect={handleGameSelect}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                Could not load popular games
              </Typography>
            )}
          </>
        )}
      </Box>

      {/* ── Fixed bottom CTA ── */}
      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        p: 2, display: 'flex', justifyContent: 'center',
        bgcolor: 'background.default',
        maxWidth: 480, mx: 'auto',
      }}>
        <PrimaryButton
          size="large"
          onClick={onViewPlaylist}
          sx={{ width: '100%', maxWidth: 400, py: 1.5 }}
        >
          Show Playlist ({selectedGames.length})
        </PrimaryButton>
      </Box>

      {/* ── Add snackbar ── */}
      <Snackbar
        open={snackbarOpen} autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 84 } }}
      >
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 3, py: 1.5, bgcolor: '#E6E0E9',
          borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '260px',
        }}>
          <Typography variant="body2" sx={{ color: '#322F35', flex: 1 }}>
            <strong>{lastAddedGame?.name}</strong> added to game list
          </Typography>
          <IconButton size="small" onClick={() => setSnackbarOpen(false)} sx={{ color: '#605D62', p: 0.25 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>
    </Box>
  );
}