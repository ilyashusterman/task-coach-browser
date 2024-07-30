import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import TaskComponent from "./TaskComponent";

const Column = ({ column, tasks, index }) => (
  <Draggable draggableId={column.id} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className="bg-green-100 p-4 rounded-lg shadow-md min-w-[300px]"
      >
        <h2
          className="font-bold mb-4 text-green-800"
          {...provided.dragHandleProps}
        >
          {column.title}
        </h2>
        <Droppable droppableId={column.id} type="TASK">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="min-h-[200px]"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <TaskComponent
                      task={task}
                      ref={provided.innerRef}
                      draggableProps={provided.draggableProps}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    )}
  </Draggable>
);

export default Column;
