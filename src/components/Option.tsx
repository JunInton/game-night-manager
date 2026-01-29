import { useRef } from "react";
import { useOption } from "react-aria";
import type { Game } from "../domain/types";
import type { Node } from "react-stately";
import type { ListState } from "react-stately";
import "./Option.css";

type OptionProps = {
  item: Node<Game>;
  state: ListState<Game>;
  games: Game[];
}

export function Option ({ item, state, games }: OptionProps) {
  const ref = useRef<HTMLLIElement>(null);

  const { optionProps, isFocused } = useOption(
    { key: item.key },
    state,
    ref
  );

  const game = games.find((g) => g.name === item.key)!;

  return (
    <li
      {...optionProps}
      ref={ref}
      className={`game-card ${isFocused ? 'game-card-focused' : ''}`}
    >
      <div className="game-image-placeholder"> 
        {/* Placeholder for game image */}
        <div className="game-image-fallback">
          {game.name.charAt(0)}
        </div>
      </div>
      <div className="game-info">
        <h3 className="game-name">{game.name}</h3>
        <p className="game-weight">
          <span className="weight-badge">{game.weight}</span>
        </p>
      </div>
      <button className="add-button" aria-label={`Add ${game.name}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </li>
  )
}

// return (
//     <li
//       {...optionProps}
//       ref={ref}
//       style={{
//         padding: "8px 12px",
//         cursor: "pointer",
//         background: isFocused ? "#eee" : "transparent",
//         fontWeight: isSelected ? "bold" : "normal",
//       }}
//     >
//       {item.textValue}
//     </li>
//   )