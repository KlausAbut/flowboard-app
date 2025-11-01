// Card component — représente une carte Kanban
// Fait par Cl@udiu
import React from "react";

export default function Card({ card }) {
  // id, title, description
  function handleDragStart(e) {
    // add small visual cue
    e.currentTarget.classList.add("dragging");
    try {
      e.dataTransfer.setData("text/plain", String(card.id));
    } catch (err) {
      // some browsers on touch may not allow setData; polyfill should help
    }
  }

  function handleDragEnd(e) {
    e.currentTarget.classList.remove("dragging");
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md"
      draggable
      data-card-id={card.id}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="text-sm font-medium text-gray-800">{card.title}</div>
      {card.description && (
        <div className="text-xs text-gray-500 mt-1">{card.description}</div>
      )}
    </div>
  );
}
