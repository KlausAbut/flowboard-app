import React from "react";
import { Droppable } from "react-beautiful-dnd";
import Card from "./Card";

const Column = ({ id, title, cards }) => {
  return (
    <div className="flex flex-col w-72 bg-gray-100 rounded-lg">
      <h2 className="p-3 font-semibold">{title}</h2>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 min-h-[100px] ${
              snapshot.isDraggingOver ? "bg-gray-200" : ""
            }`}
          >
            {cards.map((card, index) => (
              <Card key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
