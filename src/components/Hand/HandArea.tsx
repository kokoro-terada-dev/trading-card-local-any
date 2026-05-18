import { useDroppable } from "@dnd-kit/core";

import type { CardData } from "../../types/card";

import GameCard from "../Card/GameCard";

type Props = {
  cards: CardData[];

  playerIndex: number;

  onPreview: (image: string | null) => void;
};

export default function HandArea({
  cards,
  playerIndex,
  onPreview,
}: Props) {
  const { setNodeRef } = useDroppable({
    id: `hand-${playerIndex}`,

    data: {
      to: "hand",

      playerIndex,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "relative",

        width: "100%",

        minHeight: "var(--op-hand-min-height)",

        border: "2px solid #475569",

        borderRadius: "12px",

        background: "#1e293b",

        padding: "var(--op-hand-padding)",

        overflowX: "auto",
        overflowY: "hidden",

        display: "flex",

        alignItems: "center",

        touchAction: "none",
      }}
    >
      {cards.map((card, index) => {
        let marginLeft = 0;

        if (cards.length >= 8) {
          marginLeft = -10;
        }

        if (cards.length >= 9) {
          marginLeft = -15;
        }

        if (cards.length >= 10) {
          marginLeft = -20;
        }

        if (cards.length >= 11) {
          marginLeft = -25;
        }

        if (cards.length >= 12) {
          marginLeft = -27;
        }

        if (cards.length >= 13) {
          marginLeft = -30;
        }

        if (cards.length >= 14) {
          marginLeft = -33;
        }

        if (cards.length >= 16) {
          marginLeft = -35;
        }


        return (
          <div
            key={card.id}
            style={{
              flexShrink: 0,

              marginLeft: index === 0 ? 0 : `${marginLeft}px`,

              pointerEvents: "auto",

              touchAction: "none",

              zIndex: index + 1,
            }}
          >
            <GameCard
              card={card}
              playerIndex={playerIndex}
              from="hand"
              onPreview={onPreview}
            />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",

          right: "8px",

          bottom: "4px",

          fontSize: "28px",

          fontWeight: 900,

          color: "white",

          WebkitTextStroke: "2px black",

          pointerEvents: "none",

          zIndex: 999,
        }}
      >
        ×{cards.length}
      </div>
    </div>
  );
}