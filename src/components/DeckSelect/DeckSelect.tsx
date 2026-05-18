import { useEffect, useState } from "react";

import type { CSSProperties } from "react";

import { useGameStore } from "../../store/gameStore";

import DeckBuilder from "../DeckBuilder/DeckBuilder";

import type { DeckJson, DeckListItem } from "../../types/deck";

import {
  loadDeck,
  loadDeckList,
} from "../../utils/deckLoader";

import {
  buildDeckCardsFromRecipe,
  getLocalDeckRecipe,
  listLocalDeckRecipes,
} from "../../utils/localDeckStorage";

import { hasLocalCardImages } from "../../utils/localCardImages";

type PreviewTarget = "player1" | "player2" | null;

type ScreenMode = "select" | "builder";

type DeckChoice =
  | {
    kind: "public";
    path: string;
  }
  | {
    kind: "local";
    id: string;
  }
  | null;

function parseDeckValue(value: string): DeckChoice {
  if (!value) {
    return null;
  }

  if (value.startsWith("local:")) {
    return {
      kind: "local",
      id: value.replace("local:", ""),
    };
  }

  return {
    kind: "public",
    path: value,
  };
}

function toDeckValue(choice: DeckChoice) {
  if (!choice) {
    return "";
  }

  if (choice.kind === "local") {
    return `local:${choice.id}`;
  }

  return choice.path;
}

export default function DeckSelect() {
  const [mode, setMode] = useState<ScreenMode>("select");

  const [deckList, setDeckList] = useState<DeckListItem[]>([]);

  const [localDeckList, setLocalDeckList] = useState(
    listLocalDeckRecipes()
  );

  const [player1Deck, setPlayer1Deck] = useState<DeckChoice>(null);
  const [player2Deck, setPlayer2Deck] = useState<DeckChoice>(null);

  const [error, setError] = useState("");

  const [previewTarget, setPreviewTarget] =
    useState<PreviewTarget>(null);

  const [previewDeck, setPreviewDeck] =
    useState<DeckJson | null>(null);

  const startGame = useGameStore((x) => x.startGame);

  useEffect(() => {
    loadDeckList()
      .then(setDeckList)
      .catch(() => {
        setDeckList([]);
      });
  }, []);

  function refreshLocalDecks() {
    setLocalDeckList(listLocalDeckRecipes());
  }

  async function loadSelectedDeck(choice: DeckChoice) {
    if (!choice) {
      throw new Error("デッキを選択してください");
    }

    if (choice.kind === "public") {
      return await loadDeck(choice.path);
    }

    if (!hasLocalCardImages()) {
      throw new Error(
        "作成デッキを使うには、先にデッキ一覧画面で画像ZIPを読み込んでください。"
      );
    }

    const recipe = getLocalDeckRecipe(choice.id);

    if (!recipe) {
      throw new Error("保存済みデッキが見つかりません。");
    }

    return buildDeckCardsFromRecipe(recipe);
  }

  const canStart = player1Deck !== null && player2Deck !== null;

  async function handleStart() {
    setError("");

    try {
      const player1Cards = await loadSelectedDeck(player1Deck);
      const player2Cards = await loadSelectedDeck(player2Deck);

      startGame(player1Cards, player2Cards);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "デッキ読み込みに失敗しました"
      );
    }
  }

  if (mode === "builder") {
    return (
      <DeckBuilder
        onBack={() => {
          refreshLocalDecks();
          setMode("select");
        }}
      />
    );
  }

  if (previewDeck && previewTarget) {
    const totalCount =
      previewDeck.cards.reduce(
        (sum, card) => sum + card.count,
        0
      ) + 1;

    return (
      <div
        style={{
          height: "100dvh",
          background: "#0f172a",
          color: "white",
          padding: "16px",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "16px",
            border: "2px solid #475569",
            borderRadius: "16px",
            background: "#1e293b",
          }}
        >
          <button
            onClick={() => {
              setPreviewDeck(null);
              setPreviewTarget(null);
            }}
            style={{
              marginBottom: "16px",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            戻る
          </button>

          <h1>{previewDeck.name}</h1>

          <div style={{ marginBottom: "16px" }}>
            合計：{totalCount}枚
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              background: "#334155",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "16px",
            }}
          >
            {previewDeck.leader.image ? (
              <img
                src={previewDeck.leader.image}
                style={{
                  width: "90px",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "90px",
                  height: "126px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                }}
              >
                local
              </div>
            )}

            <div>
              <div style={{ fontWeight: "bold" }}>
                リーダー：{previewDeck.leader.name}
              </div>

              <div>
                ライフ：{previewDeck.leader.lifeCount}
              </div>

              <div>枚数：1枚</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {previewDeck.cards.map((card, index) => (
              <div
                key={`${card.name}-${index}`}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  background: "#334155",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                {card.image ? (
                  <img
                    src={card.image}
                    style={{
                      width: "80px",
                      borderRadius: "6px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "112px",
                      borderRadius: "6px",
                      background: "#0f172a",
                      flexShrink: 0,
                    }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold" }}>
                    {card.name}
                  </div>

                  <div>種類：{card.type}</div>
                </div>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {card.count}枚
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectStyle: CSSProperties = {
    width: "100%",
    marginTop: "8px",
    padding: "10px",
    borderRadius: "8px",
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
        padding: "12px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          padding: "20px",
          border: "2px solid #475569",
          borderRadius: "16px",
          background: "#1e293b",
        }}
      >
        <h1 style={{ marginTop: 0 }}>デッキ選択</h1>

        <button
          onClick={() => setMode("builder")}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "#16a34a",
            color: "white",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          デッキ一覧
        </button>

        <div style={{ marginBottom: "24px" }}>
          <label>プレイヤー1のデッキ</label>

          <select
            value={toDeckValue(player1Deck)}
            onChange={(e) =>
              setPlayer1Deck(parseDeckValue(e.target.value))
            }
            style={selectStyle}
          >
            <option value="">選択してください</option>

            {localDeckList.length > 0 && (
              <optgroup label="作成デッキ">
                {localDeckList.map((deck) => (
                  <option key={deck.id} value={`local:${deck.id}`}>
                    {deck.name} ({deck.mainCount}/50)
                  </option>
                ))}
              </optgroup>
            )}

            {deckList.length > 0 && (
              <optgroup label="付属デッキ">
                {deckList.map((deck) => (
                  <option key={deck.id} value={deck.path}>
                    {deck.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

        </div>

        <div style={{ marginBottom: "28px" }}>
          <label>プレイヤー2のデッキ</label>

          <select
            value={toDeckValue(player2Deck)}
            onChange={(e) =>
              setPlayer2Deck(parseDeckValue(e.target.value))
            }
            style={selectStyle}
          >
            <option value="">選択してください</option>

            {localDeckList.length > 0 && (
              <optgroup label="作成デッキ">
                {localDeckList.map((deck) => (
                  <option key={deck.id} value={`local:${deck.id}`}>
                    {deck.name} ({deck.mainCount}/50)
                  </option>
                ))}
              </optgroup>
            )}

            {deckList.length > 0 && (
              <optgroup label="付属デッキ">
                {deckList.map((deck) => (
                  <option key={deck.id} value={deck.path}>
                    {deck.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

        </div>

        {error && (
          <div style={{ color: "#f87171", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <button
          disabled={!canStart}
          onClick={handleStart}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            cursor: canStart ? "pointer" : "not-allowed",
            background: canStart ? "#2563eb" : "#64748b",
            color: "white",
            fontWeight: "bold",
          }}
        >
          開始
        </button>
      </div>
    </div>
  );
}
