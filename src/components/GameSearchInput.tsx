import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

type Props = {
  value: string;
  onChange: (value: string) => void;
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

export function GameSearchInput({ value, onChange }: Props) {
  return (
    <TextField
      fullWidth
      placeholder="What games are you playing?"
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
        }
      }}
    />
  );
}