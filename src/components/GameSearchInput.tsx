import { useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popper from '@mui/material/Popper';
import Box from '@mui/material/Box';
import type { Game } from '../domain/types';

type Props = {
  value: string;
  onChange: (value: string) => void;
  games: Game[];
  onSelect: (game: Game) => void;
  renderResults: (games: Game[]) => React.ReactNode;
};

// Future implementation for BGG search

// async function searchBGG(query: string) {
//   try {
//     const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    
//     if (!response.ok) {
//       throw new Error('Search failed');
//     }
    
//     const data = await response.json();
    
//     // data.data will be XML from BGG
//     // Parse this XML to get game info
//     console.log('BGG response:', data);
    
//     return data;
    
//   } catch (error) {
//     console.error('Search error:', error);
//     throw error;
//   }
// }

export function GameSearchInput({ value, onChange, games, renderResults }: Props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    setOpen(true);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box ref={anchorRef} sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          placeholder="What games are you playing?"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '28px',
              borderBottomLeftRadius: open && value.length > 0 ? 0 : undefined,
              borderBottomRightRadius: open && value.length > 0 ? 0 : undefined,
              '& fieldset': {
                border: 'none',
              },
            }
          }}
        />
        
        <Popper
          open={open && value.length > 0}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300 }}
          // modifiers={[
          //   {
          //     name: 'offset',
          //     options: {
          //       offset: [0, 8],
          //     },
          //   },
          // ]}
        >
          <Box sx={{ width: anchorRef.current?.offsetWidth || 'auto' }}>
            <Paper
              elevation={8}
              sx={{
                maxHeight: '60vh',
                overflow: 'auto',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backgroundImage: 'none',
                backdropFilter: 'blur(10px)',
                // border: '1px solid rgba(255, 255, 255, 0.12)',
                border: 'none',
                boxShadow: '0',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
            <Box sx={{ p: 2 }}>
              {games.length > 0 ? (
                renderResults(games)
              ) : (
                <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                  No games found
                </Box>
              )}
            </Box>
          </Paper>
          </Box>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}