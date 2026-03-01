import React, { useState } from "react";

import { useEventsListeners } from "../../../utils/events";
import { UIEvents } from "../../../constants/events";
import { useUIStore } from "../../../stores/ui";

import type { Options as ParentOptions } from "../Menu";

export type BagMenuProps = {
  setSelectedOption: React.Dispatch<
    React.SetStateAction<ParentOptions | undefined>
  >;
};

const BAG_SECTIONS = [
  {
    title: "Design Tools",
    items: [
      "Figma — UI & prototypes",
      "Cursor — AI pair programming",
      "Principle — motion design",
      "Notion — docs & wikis",
    ],
  },
  {
    title: "Books (favorites)",
    items: [
      "Don't Make Me Think — Steve Krug",
      "The Design of Everyday Things — Don Norman",
      "Shape Up — Basecamp",
    ],
  },
  {
    title: "Hobbies",
    items: [
      "Hockey stats & cards",
      "Japanese design",
      "Baseball cards",
      "Pokémon (obviously)",
    ],
  },
];

export const BagMenu = ({ setSelectedOption }: BagMenuProps) => {
  const UIStore = useUIStore();
  const [hoveredIndex, setHoveredIndex] = useState(0);

  const flatItems = BAG_SECTIONS.flatMap((s) => [
    { type: "title" as const, text: s.title },
    ...s.items.map((text) => ({ type: "item" as const, text })),
  ]);
  const maxIndex = flatItems.length - 1;

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
    <div className="menu full bag-menu">
      <div className="content">
        <div className="bag-title">Bag — Matt essentials</div>
        {BAG_SECTIONS.map((section) => (
          <div key={section.title} className="bag-section">
            <div className="bag-section-title">{section.title}</div>
            <ul>
              {section.items.map((item) => {
                const isHovered =
                  flatItems[hoveredIndex]?.type === "item" &&
                  flatItems[hoveredIndex]?.text === item;
                return (
                  <li key={item} className={isHovered ? "hovered" : ""}>
                    {item}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
