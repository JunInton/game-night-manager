import { useRef } from "react";
import { useSearchField } from "react-aria";
import { useSearchFieldState } from "react-stately";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function GameSearchInput({ value, onChange }: Props) {
  const state = useSearchFieldState({
    value,
    onChange
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const { inputProps, labelProps } = useSearchField(
    { 
      label: "Search games",
    },
    state,
    inputRef
  );

  return (
    <div>
      <label {...labelProps}>Search</label>
      <input {...inputProps} ref={inputRef} />
    </div>
  )
}