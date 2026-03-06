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
  selectedGames: Game[];              // games already in the draft playlist
  onGamesChange: (games: Game[]) => void;  // called whenever the draft list changes
  onViewPlaylist: () => void;         // navigate to PlaylistScreen
};

// ─── Search state machine ─────────────────────────────────────────────────────
// The search process has several distinct phases:
//   "idle"            – no search active (input < 3 chars or just cleared)
//   "searching"       – debounce fired, waiting for searchBGG to return IDs
//   "fetching_details"– a specific game was selected and we're fetching its full data
//   "done"            – results are ready to display
//   "no_results"      – search returned 0 matches (or errored)
type SearchState = "idle" | "searching" | "fetching_details" | "done" | "no_results";

// How many animated skeleton rows to show while a search is in-flight
const LOADER_COUNT = 6;

// We batch-fetch details (weight, images, play time) for the first 20 search
// results. Results beyond 20 are shown name-only until the user selects them.
const BATCH_FETCH_COUNT = 20;

export default function CreateListScreen({ selectedGames, onGamesChange, onViewPlaylist }: Props) {
  const [search, setSearch] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [displayGames, setDisplayGames] = useState<Game[]>([]);

  // Tracks the most recently added game so the snackbar knows what name to show.
  const [lastAddedGame, setLastAddedGame] = useState<Game | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // The BGG "hot" list — top ~20 trending games, shown when the search field is empty.
  const [hotGames, setHotGames] = useState<Game[]>([]);
  const [hotGamesLoading, setHotGamesLoading] = useState(true);

  // ─── Stale search prevention ────────────────────────────────────────────────
  // Each keypress increments searchIdRef. When an async search completes, it
  // checks whether its own id still matches the current ref value.
  // If not, a newer search was started while this one was in-flight, so we
  // discard the stale results instead of overwriting the newer ones.
  const searchIdRef = useRef(0);

  // ─── Load hot games on mount ─────────────────────────────────────────────────
  // Fetches BGG's trending list once when the component first mounts.
  // The cleanup function sets `cancelled = true` so the state updates are skipped
  // if the component unmounts before the fetch completes (prevents memory-leak warnings).
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

        // Normalise the detail response into our Game shape.
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
        // Silently fail — the user can still search manually.
      } finally {
        if (!cancelled) setHotGamesLoading(false);
      }
    };
    loadHotGames();
    // Return the cleanup function: if CreateListScreen unmounts, mark cancelled.
    return () => { cancelled = true; };
  }, []); // empty dependency array = run once on mount only

  // ─── Snackbar auto-close ──────────────────────────────────────────────────
  // When a game is added (lastAddedGame changes), open the snackbar and
  // schedule it to close after 3 seconds. clearTimeout in the cleanup prevents
  // a double-close if another game is added before the 3s expires.
  useEffect(() => {
    if (!lastAddedGame) return;
    setSnackbarOpen(true);
    const t = setTimeout(() => setSnackbarOpen(false), 3000);
    return () => clearTimeout(t);
  }, [lastAddedGame]);

  // ─── Debounced search ────────────────────────────────────────────────────
  // Fires 500ms after the user stops typing. We wait for ≥ 3 characters before
  // searching (avoids hammering the API for very short queries).
  //
  // The pattern:
  //   1. User types → searchState → "searching" immediately (shows skeletons).
  //   2. setTimeout schedules the real fetch 500ms later.
  //   3. If the user types again, the previous setTimeout is cancelled via
  //      clearTimeout in the useEffect cleanup, and a new one starts.
  //   4. Once the fetch resolves, we check the search ID to discard stale results.
  useEffect(() => {
    if (search.length < 3) {
      // Input too short — reset back to idle and clear any previous results.
      setDisplayGames([]);
      setSearchState("idle");
      return;
    }

    // Increment the ID for this particular search attempt.
    const id = ++searchIdRef.current;
    // Show skeleton loaders immediately, before the debounce fires,
    // so the UI feels responsive.
    setSearchState("searching");

    const t = setTimeout(async () => {
      try {
        // Step 1: get matching game IDs and names from BGG's search endpoint.
        const results = await searchBGG(search);

        // Discard if a newer search has started since this one was queued.
        if (id !== searchIdRef.current) return;

        if (results.length === 0) {
          setDisplayGames([]);
          setSearchState("no_results");
          return;
        }

        // Step 2: batch-fetch full details for the first BATCH_FETCH_COUNT results.
        // The rest are queued as lightweight name-only entries (no image/weight yet).
        const top = results.slice(0, BATCH_FETCH_COUNT);
        const rest = results.slice(BATCH_FETCH_COUNT);
        const topIds = top.map(r => r.id).filter(Boolean) as string[];

        if (topIds.length > 0) {
          const details = await getMultipleGameDetails(topIds);
          if (id !== searchIdRef.current) return;

          setDisplayGames([
            // Detailed results — have images, weight, and play time.
            ...details.map(d => ({
              name: d.name || 'Unknown Game',
              weight: d.weight,
              bggId: d.id ?? undefined,
              imageUrl: d.imageUrl || d.thumbnailUrl || undefined,
              thumbnailUrl: d.thumbnailUrl || undefined,
              playingTime: d.playingTime,
            })),
            // Lightweight tail — name only, weight defaults to "light" as a placeholder.
            // If the user taps one of these, handleGameSelect fetches full details then.
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
    }, 500); // 500ms debounce

    // Cleanup: cancel the pending timeout if the user types before it fires.
    return () => clearTimeout(t);
  }, [search]); // re-runs every time the search string changes

  // ─── handleGameSelect ────────────────────────────────────────────────────
  // Called when the user taps a result row.
  // If the game already has full details (image + weight), add it immediately.
  // If it's a lightweight tail result (no image/weight), fetch details first.
  const handleGameSelect = async (selected: Game) => {
    // Prevent adding duplicates — compare by name.
    if (selectedGames.some(g => g.name === selected.name)) return;

    // Fast path: game already has all the data we need (came from the top BATCH_FETCH_COUNT).
    if (selected.imageUrl && selected.weight) {
      onGamesChange([...selectedGames, selected]);
      setLastAddedGame(selected);
      // Clear the search field and results so the user can start fresh.
      setSearch("");
      setDisplayGames([]);
      setSearchState("idle");
      return;
    }

    // Slow path: lightweight result — fetch full details before adding.
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
      // Revert to "done" so the results list stays visible for a retry.
      setSearchState("done");
    }
  };

  // showResults is true whenever the query is long enough to trigger a search.
  // It controls whether we render results or the hot list.
  const showResults = search.length >= 3;

  return (
    // height: 100dvh + overflow: hidden creates a fixed-height container.
    // The results area inside is independently scrollable (overflow: auto).
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      {/* Typography token: M3/body/large-emphasized
            - fontFamily: Roboto (system body font, not Road Rage)
            - fontSize: 1rem (16px = body/large)
            - fontWeight: 500 (emphasized = medium weight in M3)
            - color: text.primary (white on dark background)
            - NOT purple — Figma shows this as white/on-surface text
      */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: 2,
        flexShrink: 0,  // prevents the header from shrinking when the results list is full
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

      {/* ── Search field ─────────────────────────────────────────────────── */}
      {/* flexShrink: 0 keeps the field from shrinking when results fill the screen. */}
      <Box sx={{ px: 2, pt: 1.5, pb: 2, flexShrink: 0 }}>
        <GameSearchInput
          value={search}
          onChange={setSearch}
          // These props are unused by GameSearchInput currently — they were
          // part of the old Popper dropdown pattern.
          games={[]}
          onSelect={() => {}}
          renderResults={() => null}
        />
      </Box>

      {/* ── Scrollable results area ────────────────────────────────────────── */}
      {/* pb: 14 prevents the last result from being hidden behind the fixed CTA button. */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 14 }}>

        {/* Skeleton loaders — shown while the search debounce is pending */}
        {showResults && searchState === "searching" && (
          <Box sx={{ mt: 1 }}>
            {Array.from({ length: LOADER_COUNT }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                {/* Thumbnail placeholder */}
                <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  {/* Title line — 68% wide to mimic a typical game title length */}
                  <Skeleton variant="text" width="68%" height={24} />
                  {/* Subtitle line — 32% wide (weight label) */}
                  <Skeleton variant="text" width="32%" height={20} sx={{ mt: 0.5 }} />
                </Box>
                {/* Add icon placeholder */}
                <Skeleton variant="circular" width={36} height={36} />
              </Box>
            ))}
          </Box>
        )}

        {/* Single skeleton row shown while fetching details for a selected game */}
        {searchState === "fetching_details" && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
            <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        )}

        {/* Search results — already-selected games are filtered out of the list
            so the user can't accidentally add the same game twice. */}
        {showResults && searchState === "done" && displayGames.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <GameSearchResults
              games={displayGames.filter(g => !selectedGames.some(s => s.name === g.name))}
              onSelect={handleGameSelect}
            />
          </Box>
        )}

        {/* Empty state — show a message when the search returned nothing */}
        {showResults && searchState === "no_results" && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No games found for "{search}"
          </Typography>
        )}

        {/* Idle state (input < 3 chars) — show trending games from BGG hot list */}
        {!showResults && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
              Browse popular games
            </Typography>

            {hotGamesLoading ? (
              // Same skeleton pattern as search loading
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
              // Show the hot list, also filtering out already-selected games.
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

      {/* ── Fixed bottom CTA ──────────────────────────────────────────────── */}
      {/* The count in the button label gives real-time feedback on how many
          games have been added without navigating away. */}
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

      {/* ── "Game added" snackbar ──────────────────────────────────────────── */}
      {/* Positioned above the fixed CTA (bottom: 84px) so it doesn't overlap it. */}
      <Snackbar
        open={snackbarOpen} autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 84 } }}
      >
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 3, py: 1.5, bgcolor: '#E6E0E9',  // dark.inverseSurface
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