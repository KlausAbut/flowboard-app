import React, { useCallback, useEffect, useState } from "react";
import Board from "./kanban/Board";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("logout failed", err);
    }
    navigate("/login");
  }

  const handleDragEnd = async (result) => {
    const { draggableId, destination, source } = result;

    // Drop outside dropzone
    if (!destination) return;

    // Drop in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Extract card and column data
    const cardId = draggableId;
    const toColumnId = destination.droppableId;

    // Optimistic update
    const sourceColumn = board.columns.find(
      (c) => String(c.id) === String(source.droppableId)
    );
    const card = sourceColumn.cards[source.index];

    const newColumns = board.columns.map((col) => {
      if (String(col.id) === String(source.droppableId)) {
        const newCards = Array.from(col.cards);
        newCards.splice(source.index, 1);
        return { ...col, cards: newCards };
      }
      if (String(col.id) === String(destination.droppableId)) {
        const newCards = Array.from(col.cards);
        newCards.splice(destination.index, 0, card);
        return { ...col, cards: newCards };
      }
      return col;
    });

    setBoard({ ...board, columns: newColumns });

    // Persist change
    try {
      await fetch(`${API}/cards/move`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          toColumnId,
          position: destination.index,
        }),
      });
    } catch (err) {
      console.warn("persist move failed, reloading board", err);
      load();
    }
  };

  // add column (optimistic)
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

  // board is passed directly to Board component

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{board.name}</h1>
          <p className="text-sm text-gray-500">Tableau ID: {board.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="text-sm px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
          >
            Copier le lien
          </button>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Se déconnecter
          </button>
        </div>
      </header>

      <Board board={board} onDragEnd={handleDragEnd} onAddCard={addCard} />

      <div className="mt-2">
        <AddColumnForm onAdd={addColumn} />
      </div>

      <div>
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
