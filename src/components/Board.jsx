import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TaskComponent from "./TaskComponent";

const Board = ({ columns, tasks: tasksWithSubtasks, onEndDrop, ...props }) => {
  const handleOnDragEnd = (result) => {
    debugger;
    const { destination, source, draggableId } = result;

    if (!destination) return;

    onEndDrop(draggableId, source, destination);
  };

  const getTasks = (columnId) => {
    const columnTasks =
      tasksWithSubtasks.find((taskColumn) => taskColumn.id === columnId)
        ?.tasks || [];
    return columnTasks.map((task) => ({ ...task, column: columnId }));
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <Droppable
            key={column.id}
            droppableId={column.id.toString()}
            type="TASK"
          >
            {(provided) => (
              <div
                className="bg-green-100 p-4 rounded-lg shadow-md min-w-[300px]"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <h2 className="font-bold mb-4 text-green-800">
                  {column.title}
                </h2>
                {getTasks(column.id).map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id.toString()}
                    index={index}
                  >
                    {(providedDrag, snapshot) => (
                      <div
                        ref={providedDrag.innerRef}
                        {...providedDrag.draggableProps}
                        {...providedDrag.dragHandleProps}
                      >
                        <TaskComponent
                          task={task}
                          columnId={column.id}
                          updateTask={props.updateTask}
                          deleteTask={props.deleteTask}
                          handleFileUpload={props.handleFileUpload}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Board;
