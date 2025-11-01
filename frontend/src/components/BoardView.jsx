// BoardView — assemble les colonnes, gère les ajouts et le drag/drop
// Fait par Cl@udiu
import React, { useCallback, useEffect, useState } from "react";
import Column from "./Column";
import { io } from "socket.io-client";

export default function BoardView({ boardId }) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // fetch board
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/board/${boardId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setBoard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API, boardId]);

  useEffect(() => {
    load();
    const socket = io(API, { withCredentials: true });
    socket.on("connect", () => console.log("socket connected", socket.id));
    socket.on("board:updated", () => {
      // quand le serveur notifie, recharger
      load();
    });

    return () => socket.disconnect();
  }, [API, load]);

  // helper : find column by id (kept for future features)
  function _findColumn(colId) {
    return board.columns.find((c) => String(c.id) === String(colId));
  }

  // drop handler: move card locally then emit event (optimistic)
  async function handleDropCard(cardId, toColumnId) {
    if (!board) return;
    const fromCol = board.columns.find((c) =>
      c.cards.some((card) => String(card.id) === String(cardId))
    );
    if (!fromCol) return;
    if (String(fromCol.id) === String(toColumnId)) return; // nothing

    // extract card
    const card = fromCol.cards.find((c) => String(c.id) === String(cardId));
    // optimistic update
    const newColumns = board.columns.map((col) => {
      if (String(col.id) === String(fromCol.id)) {
        return {
          ...col,
          cards: col.cards.filter((c) => String(c.id) !== String(cardId)),
        };
      }
      if (String(col.id) === String(toColumnId)) {
        return { ...col, cards: [...col.cards, card] };
      }
      return col;
    });
    setBoard({ ...board, columns: newColumns });

    // essayer d'appeler l'API pour persister (endpoint backend non-implementé pour updates dans ce repo)
    try {
      await fetch(`${API}/cards/move`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, toColumnId }),
      });
    } catch (err) {
      // si échec, on reload le board
      console.warn("persist move failed, reloading board", err);
      load();
    }
  }

  // add column (optimistic) — persist if endpoint exists
  async function addColumn(title) {
    const newCol = {
      id: `tmp-${Date.now()}`,
      title,
      position: board.columns.length,
      cards: [],
    };
    setBoard({ ...board, columns: [...board.columns, newCol] });
    try {
      const res = await fetch(`${API}/columns`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, title }),
      });
      if (res.ok) load();
    } catch (err) {
      console.warn("create column failed", err);
      load();
    }
  }

  // add card (kept for future usage)
  async function addCard(columnId, title, description) {
    const newCard = {
      id: `tmp-${Date.now()}`,
      title,
      description,
      position: 0,
    };
    const newColumns = board.columns.map((col) => {
      if (String(col.id) === String(columnId)) {
        return { ...col, cards: [...col.cards, newCard] };
      }
      return col;
    });
    setBoard({ ...board, columns: newColumns });
    try {
      const res = await fetch(`${API}/cards`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, title, description }),
      });
      if (res.ok) load();
    } catch (err) {
      console.warn("create card failed", err);
      load();
    }
  }

  if (loading) return <div>Chargement...</div>;
  if (!board) return <div>Board introuvable</div>;

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            onDropCard={handleDropCard}
            onAddCard={addCard}
          />
        ))}
      </div>

      <div className="mt-4">
        <AddColumnForm onAdd={addColumn} />
      </div>
      <div className="mt-4">
        <small className="text-gray-500">
          Note: les actions d'écriture sont optimistes — le backend peut
          nécessiter l'ajout d'endpoints pour être persistées.
        </small>
      </div>
    </div>
  );
}

function AddColumnForm({ onAdd }) {
  const [title, setTitle] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title.trim());
        setTitle("");
      }}
      className="max-w-md"
    >
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nouvelle colonne"
          className="flex-1 border rounded px-2 py-1"
        />
        <button className="px-3 bg-blue-600 text-white rounded">Ajouter</button>
      </div>
    </form>
  );
}
