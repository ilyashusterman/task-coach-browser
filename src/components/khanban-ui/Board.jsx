import React, { useState, useCallback, useRef } from "react";
import TaskComponent from "./TaskComponent";

const Board = ({ columns: initialColumns, tasks, setTasks, ...props }) => {
  const [columns, setColumns] = useState(initialColumns);
  // const [tasks, setTasks] = useState(initialTasks);
  // const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragCounter = useRef(0);

  const getTasks = (columnId) => {
    const tasksState =
      tasks.find((taskColumn) => taskColumn.id === columnId)?.tasks || [];

    return tasksState.map((task) => ({ ...task, column: columnId }));
  };

  const handleDragStart = useCallback((task, e) => {
    setDraggedTask(task);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";

    const dragImage = e.target.cloneNode(true);
    dragImage.style.opacity = "0.5";
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, []);

  const handleDragEnter = useCallback((e, columnId) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverColumn(null);
      setDragOverIndex(null);
    }
  }, []);

  const handleDragOver = useCallback((e, columnId, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (columnId, dropIndex) => {
      if (draggedTask) {
        const updatedTasks = tasks.map((taskColumn) => ({
          ...taskColumn,
          tasks:
            taskColumn.id === draggedTask.column
              ? taskColumn.tasks.filter((t) => t.id !== draggedTask.id)
              : taskColumn.tasks,
        }));

        const targetColumn = updatedTasks.find(
          (taskColumn) => taskColumn.id === columnId
        );
        if (targetColumn) {
          const newTask = { ...draggedTask, column: columnId };
          targetColumn.tasks.splice(dropIndex, 0, newTask);
        }

        setTasks(updatedTasks);
        setDraggedTask(null);
        setDragOverColumn(null);
        setDragOverIndex(null);
        dragCounter.current = 0;
      }
    },
    [draggedTask, tasks]
  );

  const updateTask = useCallback((columnId, taskId, updates) => {
    setTasks((prevTasks) =>
      prevTasks.map((taskColumn) =>
        taskColumn.id === columnId
          ? {
              ...taskColumn,
              tasks: taskColumn.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
            }
          : taskColumn
      )
    );
  }, []);

  const deleteTask = useCallback((columnId, taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((taskColumn) =>
        taskColumn.id === columnId
          ? {
              ...taskColumn,
              tasks: taskColumn.tasks.filter((task) => task.id !== taskId),
            }
          : taskColumn
      )
    );
  }, []);
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`bg-green-100 p-4 rounded-lg shadow-md min-w-[300px] transition-all duration-300 ${
            dragOverColumn === column.id
              ? "ring-2 ring-green-400 shadow-lg"
              : ""
          }`}
          onDragEnter={(e) => handleDragEnter(e, column.id)}
          onDragLeave={handleDragLeave}
          onDragOver={(e) =>
            handleDragOver(
              e,
              column.id,
              tasks.find((t) => t.id === column.id)?.tasks.length || 0
            )
          }
          onDrop={() =>
            handleDrop(
              column.id,
              tasks.find((t) => t.id === column.id)?.tasks.length || 0
            )
          }
        >
          <h2 className="font-bold mb-4 text-green-800">{column.title}</h2>
          {getTasks(column.id).map((task, index) => (
            <React.Fragment key={task.id}>
              {dragOverColumn === column.id && dragOverIndex === index && (
                <div className="h-2 bg-green-300 rounded my-2 transition-all duration-300" />
              )}
              <TaskComponent
                task={task}
                columnId={column.id}
                columnPrecent={
                  initialColumns.findIndex(
                    (columnIdx) => columnIdx.id == column.id
                  ) /
                    columns.length +
                  (1 / columns.length) * 2
                }
                updateTask={updateTask}
                deleteTask={deleteTask}
                handleDragStart={handleDragStart}
                handleDragOver={(e) => handleDragOver(e, column.id, index)}
                handleDrop={() => handleDrop(column.id, index)}
                isDragging={draggedTask && draggedTask.id === task.id}
                {...props}
              />
            </React.Fragment>
          ))}

          {dragOverColumn === column.id &&
            dragOverIndex ===
              tasks.find((t) => t.id === column.id)?.tasks.length && (
              <div className="h-2 bg-green-300 rounded my-2 transition-all duration-300" />
            )}
        </div>
      ))}
    </div>
  );
};

export default Board;
