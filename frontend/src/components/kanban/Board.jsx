import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";

const Board = ({ board, onDragEnd, onAddCard }) => {
  const columns = board.columns || [];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto py-4">
        {columns.length === 0 && (
          <div className="p-6 text-gray-500">Aucune colonne sur ce board.</div>
        )}

        {columns.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            cards={col.cards}
            onAddCard={onAddCard}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default Board;
