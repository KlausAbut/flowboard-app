import React from "react";
import { Draggable } from "react-beautiful-dnd";

const Card = ({ card, index }) => {
  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 mb-3 bg-white rounded-lg border shadow-sm hover:shadow-md transform transition-transform ${
            snapshot.isDragging ? "scale-105 shadow-lg" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-800">{card.title}</h3>
            <span className="text-xs text-gray-400">#{card.id}</span>
          </div>
          {card.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {card.description}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Card;
