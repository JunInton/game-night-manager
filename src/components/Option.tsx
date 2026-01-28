import { useRef } from "react";
import { useOption } from "react-aria";
import type { Game } from "../domain/types";
import type { Node } from "react-stately";
import type { ListState } from "react-stately";

type OptionProps = {
  item: Node<Game>;
  state: ListState<Game>;
}

export function Option ({ item, state }: OptionProps) {
  const ref = useRef<HTMLLIElement>(null);

  const { optionProps, isFocused, isSelected } = useOption(
    { key: item.key },
    state,
    ref
  );

  return (
    <li
      {...optionProps}
      ref={ref}
      style={{
        padding: "8px 12px",
        cursor: "pointer",
        background: isFocused ? "#eee" : "transparent",
        fontWeight: isSelected ? "bold" : "normal",
      }}
    >
      {item.textValue}
    </li>
  )
}