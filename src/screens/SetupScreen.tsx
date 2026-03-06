// Old design structure for reference while building the new one. The new design is in StartScreen.tsx and CreateListScreen.tsx.

// import { useState, useEffect } from "react";
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import IconButton from '@mui/material/IconButton';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemText from '@mui/material/ListItemText';
// import Chip from '@mui/material/Chip';
// import Alert from '@mui/material/Alert';
// import Snackbar from '@mui/material/Snackbar';
// import Skeleton from '@mui/material/Skeleton';
// import CloseIcon from '@mui/icons-material/Close';
// import DeleteIcon from '@mui/icons-material/Delete';
// import type { Game } from "../domain/types";
// import { GameSearchInput } from "../components/GameSearchInput";
// import { GameSearchResults } from "../components/GameSearchResults";
// import { Header } from "../components/Header";
// // import { demoGames } from "../domain/demoGames";
// import { PrimaryButton } from "../components/PrimaryButton";
// import { searchBGG, getGameDetails, getMultipleGameDetails } from "../services/bggApi";

// // Temporary function to test BGG API integration - will remove later
// // const handleTestAPI = async () => {
// //   console.log('Testing search...');
// //   const results = await searchBGG('wingspan');
// //   console.log('Search results:', results);

// //   if (results.length > 0) {
// //     console.log('Testing game details...');
// //     const details = await getGameDetails(results[0].id!);
// //     console.log('Game details:', details);
// //   }
// // }

// type Props = {
//   onNext: (games: Game[]) => void;
// };

// export default function SetupScreen({ onNext }: Props) {
//   const [started, setStarted] = useState(false);
//   const [search, setSearch] = useState("");
//   const [selectedGames, setSelectedGames] = useState<Game[]>([]);
//   const [showSearchResults, setShowSearchResults] = useState(true);
//   const [lastAddedGame, setLastAddedGame] = useState<Game | null>(null);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);

//   // BGG search state
//   // const [bggResults, setBggResults] = useState<any[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [isFetchingDetails, setIsFetchingDetails] = useState(false);
//   // const [isFetchingThumbnails, setIsFetchingThumbnails] = useState(false);
//   const [displayGames, setDisplayGames] = useState<Game[]>([]);

//   // Auto-close snackbar after 3 seconds, resets timer on new game
//   useEffect(() => {
//     if (lastAddedGame) {
//       setSnackbarOpen(true);
//       const timer = setTimeout(() => {
//         setSnackbarOpen(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [lastAddedGame]);

//   // Combined search + thumbnail fetch
//   useEffect(() => {
//     const searchAndFetchDetails = async () => {
//       if (search.length >= 3) {
//         setIsSearching(true);
        
//         try {
//           // Step 1: Search to get game IDs
//           const searchResults = await searchBGG(search);
          
//           if (searchResults.length === 0) {
//             setDisplayGames([]);
//             setIsSearching(false);
//             return;
//           }
          
//           // Step 2: Batch-fetch details for top 10 results
//           const topResults = searchResults.slice(0, 10);
//           const remainingResults = searchResults.slice(10);
//           const topIds = topResults.map(r => r.id).filter(Boolean) as string[];
          
//           if (topIds.length > 0) {
//             const details = await getMultipleGameDetails(topIds);
            
//             // Top 10 with images and accurate weights
//             const gamesWithThumbnails: Game[] = details.map(d => ({
//               name: d.name || 'Unknown Game',
//               weight: d.weight,
//               bggId: d.id || undefined,
//               imageUrl: d.thumbnailUrl || d.imageUrl || undefined,
//             }));
            
//             // Remaining results (11+) without images
//             const gamesWithoutThumbnails: Game[] = remainingResults.map(r => ({
//               name: r.name || 'Unknown Game',
//               weight: 'light' as const,
//               bggId: r.id || undefined,
//             }));
            
//             setDisplayGames([...gamesWithThumbnails, ...gamesWithoutThumbnails]);
//           } else {
//             // Fallback if no valid IDs
//             setDisplayGames(searchResults.map(r => ({
//               name: r.name || 'Unknown Game',
//               weight: 'light' as const,
//               bggId: r.id || undefined,
//             })));
//           }
          
//         } catch (error) {
//           console.error('Search error:', error);
//           setDisplayGames([]);
//         } finally {
//           setIsSearching(false);
//         }
//       } else {
//         setDisplayGames([]);
//       }
//     };

//     const timeoutId = setTimeout(searchAndFetchDetails, 500);
//     return () => clearTimeout(timeoutId);
//   }, [search]);

//   // Old code
//   // // Debounced BGG search
//   // useEffect(() => {
//   //   const searchBGGDebounced = async () => {
//   //     if (search.length >= 3) {
//   //       setIsSearching(true);
//   //       try {
//   //         const results = await searchBGG(search);
//   //         setBggResults(results);
//   //       } catch (error) {
//   //         console.error("Error searching BGG:", error);
//   //         setBggResults([]);
//   //       } finally {
//   //         setIsSearching(false);
//   //       }
//   //     } else {
//   //       setBggResults([]);
//   //       setDisplayGames([]);
//   //     }
//   //   };

//   //   const timeoutId = setTimeout(searchBGGDebounced, 500); // 500ms debounce
//   //   return () => clearTimeout(timeoutId);
//   // }, [search]);

//   // // Fetch thumbnails for search results
//   // useEffect(() => {
//   //   const fetchThumbnails = async () => {
//   //     if (bggResults.length === 0 ) {
//   //       setDisplayGames([]);
//   //       return;
//   //     }

//   //     setIsFetchingThumbnails(true);

//   //     // Take onl top 10 results to avoid too many requests
//   //     const resultsToFetch = bggResults.slice(0, 5);
//   //     const remainingResults = bggResults.slice(5);

//   //     try {
//   //       // Batch fetch details
//   //       const gameIds = resultsToFetch.map(result => result.id).filter(Boolean) as string[];

//   //       if (gameIds.length === 0) {
//   //         setDisplayGames([]);
//   //         setIsFetchingThumbnails(false);
//   //         return;
//   //       }

//   //       const allDetails = await getMultipleGameDetails(gameIds);

//   //       // Convert to Game format, filtering out any that failed
//   //       const gamesWithThumbnails: Game[] = allDetails.map(details => ({
//   //         name: details.name,
//   //         weight: details.weight,
//   //         bggId: details.id,
//   //         imageUrl: details.thumbnailUrl || details.imageUrl,
//   //       }));

//   //       // Add remaining results without thumbnails as fallback
//   //       const gamesWithoutThumbnails: Game[] = remainingResults.map(result => ({
//   //         name: result.name || 'Unknown Game',
//   //         weight: 'light' as const, // Placeholder
//   //         bggId: result.id
//   //       }));

//   //       setDisplayGames([...gamesWithThumbnails, ...gamesWithoutThumbnails]);

//   //     } catch (error) {
//   //       console.error("Error fetching game details:", error);
//   //       // Fallback to games without thumbnails
//   //       setDisplayGames(resultsToFetch.map(result => ({
//   //         name: result.name || 'Unknown Game',
//   //         weight: 'light' as const, // Placeholder
//   //         bggId: result.id
//   //       })));

//   //     } finally {
//   //       setIsFetchingThumbnails(false);
//   //     }
//   //   };

//   //   fetchThumbnails();
//   // }, [bggResults]);


//   // Handle game selection
//   const handleBGGGameSelect = async (selectedGame: Game) => {
//     // Check if game already has full details (from thumbnail fetch)
//     if (selectedGame.imageUrl && selectedGame.weight) {
//       // Already have the details, just add it
//       setSelectedGames([...selectedGames, selectedGame]);
//       setLastAddedGame(selectedGame);
//       setSearch("");
//       // setBggResults([]);
//       setDisplayGames([]);
//       return;
//     }

//     //Otherwise, fetch full details
//     setIsFetchingDetails(true);
//     try {
//       const details = await getGameDetails(selectedGame.bggId!);

//       const game: Game = {
//         name: details.name,
//         weight: details.weight,
//         bggId: details.id,
//         imageUrl: details.imageUrl,
//       };

//       setSelectedGames([...selectedGames, game]);
//       setLastAddedGame(game);
//       setSearch("");
//       // setBggResults([]);
//       setDisplayGames([]);
//     } catch (error) {
//       console.error("Error fetching game details:", error);
//       alert('Failed to add game. Please try again.');
//     } finally {
//       setIsFetchingDetails(false);
//     }
//   };

//   // Old code

//   // const filteredGames = demoGames
//   //   .filter((game) =>
//   //     game.name.toLowerCase().startsWith(search.toLowerCase()) &&
//   //     !selectedGames.some((selected) => selected.name === game.name)
//   //   )
//   //   .sort((a, b) => a.name.localeCompare(b.name)); // Alphabetize search results

//   // const displayGames = search ? filteredGames : demoGames
//   //   .filter((game) => !selectedGames.some((selected) => selected.name === game.name))

//   // // Alphabetize the selected games for display in playlist
//   // const sortedSelectedGames = [...selectedGames].sort((a, b) => a.name.localeCompare(b.name));

//   // Initial state - showing large title and create button
//   if (!started) {
//     return (
//       <Box 
//         sx={{ 
//           display: 'flex', 
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           minHeight: '100dvh',
//           p: 3,
//           overflow: 'hidden',
//         }}
//       >
//         <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           <Typography 
//             variant="h1"
//             component="h1"
//             align="center"
//             sx={{
//               fontSize: { xs: '80px', sm: '120px' },
//               background: 'linear-gradient(135deg, #6750A4 0%, #9575CD 100%)',
//               WebkitBackgroundClip: 'text',
//               WebkitTextFillColor: 'transparent',
//               backgroundClip: 'text',
//             }}
//           >
//             GAME NIGHT
//             <br />
//             MANAGER
//           </Typography>
//         </Box>

//         {/* Temporary button for testing BGG API integration - will remove later */}
//         {/* <button onClick={handleTestAPI}>Test BGG API</button> */}
        
//         <PrimaryButton
//           size="large"
//           startIcon={
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
//             </svg>
//           }
//           onClick={() => setStarted(true)}
//           sx={{
//             width: '100%',
//             maxWidth: 400,
//             py: 2,
//             mb: 4,
//           }}
//           >
//           Create game list
//         </PrimaryButton>
//       </Box>
//     );
//   }

//   // Started state - showing search and games
//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
//       <Header 
//         showToggle={true}
//         toggleState={showSearchResults}
//         onToggle={() => setShowSearchResults(!showSearchResults)}
//       />

//       {showSearchResults ? (
//         <Box sx={{ p: 2, flexShrink: 0 }}>
//           <GameSearchInput 
//             value={search} 
//             onChange={setSearch}
//             games={displayGames}
//             onSelect={handleBGGGameSelect}
//             renderResults={(games) => (
//               <>
//                 {isSearching ? (
//                   // Show skeleton loaders
//                   <Box>
//                     {[1, 2, 3].map((i) => (
//                       <Box
//                         key={i}
//                         sx={{
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: 1.5,
//                           p: 1.5,
//                           mb: 1.5,
//                           borderRadius: 2,
//                         }}
//                       >
//                         {/* Thumbnail skeleton */}
//                         <Skeleton
//                           variant="rectangular"
//                           width={80}
//                           height={80}
//                           sx={{ borderRadius: 1 }}
//                         />

//                         {/* Text skeleton */}
//                         <Box sx={{ flex: 1 }}>
//                           <Skeleton variant="text" width="70%" height={24} />
//                           <Skeleton variant="text" width="30%" height={20} />
//                         </Box>

//                         {/* Button skeleton */}
//                         <Skeleton variant="circular" width={40} height={40} />
//                       </Box>
//                     ))}
//                   </Box>
//                 ) : isFetchingDetails ? (
//                   // Show a single skeleton for the game being added
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: 1.5,
//                       p: 1.5,
//                       mb: 1.5,
//                       borderRadius: 2,
//                     }}
//                   >
//                     <Skeleton
//                       variant="rectangular"
//                       width={80}
//                       height={80}
//                       sx={{ borderRadius: 1 }}
//                     />
//                     <Box sx={{ flex: 1 }}>
//                       <Skeleton variant="text" width="60%" height={24} />
//                       <Skeleton variant="text" width="40%" height={20} />
//                     </Box>
//                   </Box>
//                 ) : games.length > 0 ? (
//                   <GameSearchResults
//                     games={games}
//                     onSelect={handleBGGGameSelect}
//                   />
//                 ) : search.length >= 3 ? (
//                   <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
//                     No games found
//                   </Typography>
//                 ) : null}
//               </>
//             )}
//           />
//         </Box>
//       ) : (
//         <Alert severity="info" sx={{ display: 'flex', m: 2, flexShrink: 0, justifyContent: 'center',}}>
//           Click the + to add more games
//         </Alert>
//       )}

//       <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: !showSearchResults ? { xs: 18, sm: 14 } : 2 }}>
//         {showSearchResults ? (
//           search.length > 0 && search.length < 3 ? (
//             <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
//               Type at least 3 characters to search BoardGameGeek
//             </Typography>
//           ) : null
//         ) : (
//           <>
//             <Typography variant="h6" sx={{ my: 2 }}>
//               Your playlist
//             </Typography>
//             {selectedGames.length > 0 ? (
//               <List>
//                 {selectedGames.map((game) => (
//                   <ListItem
//                     key={game.bggId || game.name}
//                     secondaryAction={
//                       <IconButton
//                         edge="end"
//                         aria-label={`Remove ${game.name}`}
//                         onClick={() => {
//                           setSelectedGames(selectedGames.filter(g => g.name !== game.name));
//                         }}
//                       >
//                         <DeleteIcon />
//                       </IconButton>
//                     }
//                     sx={{
//                       bgcolor: 'background.paper',
//                       mb: 1,
//                       borderRadius: 1,
//                       border: 1,
//                       borderColor: 'divider'
//                     }}
//                   >
//                     {game.imageUrl && (
//                       <Box
//                         component="img"
//                         src={game.imageUrl}
//                         alt={game.name}
//                         sx={{
//                           width: 60,
//                           height: 60,
//                           objectFit: 'cover',
//                           borderRadius: 1,
//                           mr: 2,
//                         }}
//                       />
//                     )}
//                     <ListItemText
//                       primary={game.name}
//                       secondary={<Chip label={game.weight} size="small" sx={{ mt: 0.5 }} />}
//                     />
//                   </ListItem>
//                 ))}
//               </List>
//             ) : (
//               <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 5 }}>
//                 No games selected yet.
//               </Typography>
//             )}
//           </>
//         )}
//       </Box>

//       {showSearchResults && (
//         <Snackbar
//           open={snackbarOpen}
//           autoHideDuration={3000}
//           onClose={() => setSnackbarOpen(false)}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//           sx={{ bottom: { xs: 24, sm: 24 } }}
//         >
//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 2,
//               px: 3,
//               py: 1.5,
//               bgcolor: 'rgba(255, 255, 255, 0.95)',
//               color: '#000',
//               borderRadius: '4px',
//               width: 'auto',
//               maxWidth: '90%',
//               minWidth: '280px',
//               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
//             }}
//           >
//             <Typography variant="body1" sx={{ color: '#000' }}>
//               <strong>{lastAddedGame?.name}</strong> is added to game list.
//             </Typography>
//             <IconButton 
//               size="small" 
//               onClick={() => setSnackbarOpen(false)}
//               sx={{ color: '#666' }}
//             >
//               <CloseIcon fontSize="small" />
//             </IconButton>
//           </Box>
//         </Snackbar>
//       )}

//       {!showSearchResults && (
//         <Box sx={{ 
//           p: 2, 
//           position: 'fixed', 
//           bottom: 0, 
//           left: 0, 
//           right: 0, 
//           bgcolor: 'background.default',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//         }}>
//           <PrimaryButton
//             size="large"
//             onClick={() => onNext(selectedGames)}
//             disabled={selectedGames.length === 0}
//             sx={{
//               width: '100%',
//               maxWidth: 400,
//               py: 2,
//             }}
//           >
//             Ready to game
//           </PrimaryButton>
//         </Box>
//       )}
//     </Box>
//   );
// }