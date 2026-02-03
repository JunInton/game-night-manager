import { useRef } from "react";
import { useSearchField } from "react-aria";
import { useSearchFieldState } from "react-stately";
import "./GameSearchInput.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

async function searchBGG(query: string) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    const data = await response.json();
    
    // data.data will be XML from BGG
    // Parse this XML to get game info
    console.log('BGG response:', data);
    
    return data;
    
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export function GameSearchInput({ value, onChange }: Props) {
  const state = useSearchFieldState({
    value,
    onChange
  });

  const ref = useRef<HTMLInputElement>(null);

  const { inputProps, labelProps } = useSearchField(
    { 
      label: "Search games",
    },
    state,
    ref
  );

  return (
    <div className="search-field">
      <label {...labelProps} className="search-label">Search</label>
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
          d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          />
        </svg>
        <input {...inputProps} ref={ref} className="search-input" />
      </div>
    </div>
  )
}