import React, { useState } from "react";

import { useEventsListeners } from "../../../utils/events";
import { UIEvents } from "../../../constants/events";
import { useUIStore } from "../../../stores/ui";

import type { Options as ParentOptions } from "../Menu";

export type YouMenuProps = {
  setSelectedOption: React.Dispatch<
    React.SetStateAction<ParentOptions | undefined>
  >;
};

const YOU_LINES = [
  "Matt Silverman",
  "Product / UI-UX Designer",
  "San Diego, CA",
  "—",
  "Silvertown Trainer",
  "Specialties: UI/UX, Web, Design Systems",
  "Likes: Hockey stats, baseball cards,",
  "Japanese design, Pokémon.",
  "—",
  "This town is a portfolio easter egg.",
  "Welcome to Silvertown.",
];

export const YouMenu = ({ setSelectedOption }: YouMenuProps) => {
  const UIStore = useUIStore();
  const [hoveredIndex, setHoveredIndex] = useState(0);

  const maxIndex = YOU_LINES.length - 1;
  const hoverPrevious = () => {
    setHoveredIndex((i) => (i <= 0 ? maxIndex : i - 1));
  };
  const hoverNext = () => {
    setHoveredIndex((i) => (i >= maxIndex ? 0 : i + 1));
  };

  useEventsListeners(
    [
      { name: UIEvents.UP, callback: hoverPrevious },
      { name: UIEvents.DOWN, callback: hoverNext },
      { name: UIEvents.EXIT, callback: () => setSelectedOption(undefined) },
    ],
    [UIStore.menu.isOpen],
  );

  return (
    <div className="menu full you-menu">
      <div className="content">
        <div className="you-title">You — Trainer Card</div>
        <div className="you-card">
          {YOU_LINES.map((line, i) => (
            <div
              key={`${i}-${line}`}
              className={`you-line ${i === hoveredIndex ? "hovered" : ""}`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
