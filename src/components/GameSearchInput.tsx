import { useRef } from "react";
import { useSearchField } from "react-aria";
import { useSearchFieldState } from "react-stately";
import "./GameSearchInput.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

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