import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";

const Board = ({ data, onDragEnd }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4">
        {Object.entries(data).map(([columnId, column]) => (
          <Column
            key={columnId}
            id={columnId}
            title={column.title}
            cards={column.cards}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default Board;
