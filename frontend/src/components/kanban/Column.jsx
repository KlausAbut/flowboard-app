import React from "react";
import { Droppable } from "react-beautiful-dnd";
import Card from "./Card";

const Column = ({ id, title, cards = [], onAddCard }) => {
  return (
    <div className="flex flex-col w-80 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-3">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <span className="text-sm text-gray-500">{cards.length}</span>
      </div>

      <Droppable droppableId={String(id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 min-h-[120px] transition-colors ${
              snapshot.isDraggingOver ? "bg-blue-50" : "bg-white"
            }`}
          >
            {cards.map((card, index) => (
              <Card key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}

            {onAddCard && (
              <div className="mt-2">
                <button
                  onClick={() => {
                    const title = window.prompt("Titre de la carte:");
                    if (title && title.trim()) onAddCard(id, title.trim(), "");
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Ajouter une carte
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
