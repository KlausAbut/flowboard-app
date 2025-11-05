import React from "react";
import { Draggable } from "react-beautiful-dnd";

const Card = ({ card, index }) => {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 mb-2 bg-white rounded shadow ${
            snapshot.isDragging ? "shadow-lg" : ""
          }`}
        >
          <h3 className="font-medium">{card.title}</h3>
          {card.description && (
            <p className="mt-2 text-sm text-gray-600">{card.description}</p>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Card;
