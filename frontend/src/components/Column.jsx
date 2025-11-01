// Column component — contient des cartes et gère le drag/drop
// Fait par Cl@udiu
import React from "react";
import Card from "./Card";

export default function Column({ column, onDropCard, onDragStart, onAddCard }) {
  const containerRef = React.useRef(null);

  // support synthetic touchdrop event from the inline polyfill
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onTouchDrop(ev) {
      const cardId = ev.detail && ev.detail.cardId;
      if (cardId) onDropCard && onDropCard(cardId, column.id);
    }
    el.addEventListener("touchdrop", onTouchDrop);
    return () => el.removeEventListener("touchdrop", onTouchDrop);
  }, [column.id, onDropCard]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 min-w-[250px] shrink-0">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-semibold text-gray-800 leading-tight">
            {column.title}
          </h2>
          <div className="text-xs text-gray-400">
            {column.cards.length} cards
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        data-column-id={column.id}
        className="space-y-3 min-h-[50px]"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("drop-target");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("drop-target");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("drop-target");
          const cardId = e.dataTransfer.getData("text/plain");
          onDropCard && onDropCard(cardId, column.id);
        }}
      >
        {column.cards.map((card) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => {
              try {
                e.dataTransfer.setData("text/plain", card.id);
              } catch (_) {}
              onDragStart && onDragStart(card.id, column.id);
            }}
            onDragEnd={(e) => {
              // ensure drop-target highlight is removed
              const targets = document.querySelectorAll(".drop-target");
              targets.forEach((t) => t.classList.remove("drop-target"));
            }}
          >
            <Card card={card} />
          </div>
        ))}

        {/* Add card form */}
        <AddCardForm columnId={column.id} onAddCard={onAddCard} />
      </div>
    </div>
  );
}

function AddCardForm({ columnId, onAddCard }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddCard && onAddCard(columnId, title.trim(), desc.trim());
    setTitle("");
    setDesc("");
    setOpen(false);
  }

  if (!open)
    return (
      <button
        className="mt-2 text-sm text-blue-600"
        onClick={() => setOpen(true)}
      >
        + Add card
      </button>
    );

  return (
    <form onSubmit={submit} className="space-y-2 mt-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="w-full border rounded px-2 py-1"
      />
      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description (optionnel)"
        className="w-full border rounded px-2 py-1"
      />
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-blue-600 text-white rounded">
          Add
        </button>
        <button
          type="button"
          className="px-3 py-1"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
