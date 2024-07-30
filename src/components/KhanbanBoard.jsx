import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  resetServerContext,
} from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import LoadingIndicator from "./LoadingIndicator";
import {
  ASSISTANT_SYSTEM_PROMPT_TO_JSON,
  ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
} from "../system-prompt";
import { useModel } from "../contexts/ModelContext";
import TaskComponent from "./TaskComponent";
import Board from "./Board";

const INITIAL_COLUMNS = [
  { id: "backlog", title: "Backlog", tasks: {} },
  { id: "todo", title: "To Do", tasks: {} },
  { id: "in-progress", title: "In Progress", tasks: {} },
  { id: "review", title: "Review", tasks: {} },
  { id: "done", title: "Done", tasks: {} },
  { id: "blocked", title: "Blocked", tasks: {} },
];

const KanbanBoard = () => {
  const { chatCompletion, chatCompletionJSON, isModelLoaded } = useModel();
  const [board, setBoard] = useState({
    id: "board-1",
    title: "My Kanban Board",
    columns: INITIAL_COLUMNS.reduce((acc, column) => {
      acc[column.id] = column;
      return acc;
    }, {}),
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    estimatedTime: "1 hour",
    column: INITIAL_COLUMNS[0].id,
    id: uuidv4(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const saveBoardState = () => {
    localStorage.setItem("kanbanBoard", JSON.stringify(board));
    alert("Board state saved successfully!");
  };

  const exportBoardState = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(board));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "kanban_board_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importBoardState = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedBoard = JSON.parse(e.target.result);
          setBoard(importedBoard);
          localStorage.setItem("kanbanBoard", JSON.stringify(importedBoard));
          alert("Board state imported successfully!");
        } catch (error) {
          alert("Error importing board state. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };
  const handleFileUpload = (columnId, taskId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          data: e.target.result,
        };
        updateTask(columnId, taskId, {
          attachments: [
            ...board.columns[columnId].tasks[taskId].attachments,
            attachment,
          ],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const savedBoard = localStorage.getItem("kanbanBoard");

    if (savedBoard) {
      const parsedBoard = JSON.parse(savedBoard);
      setBoard(parsedBoard);
    } else {
      debugger;
      // Initialize with default columns
      const initialColumns = INITIAL_COLUMNS.reduce((acc, column) => {
        acc[column.id] = { id: column.id, title: column.title, tasks: {} };
        return acc;
      }, {});
      setBoard((prev) => ({ ...prev, columns: initialColumns }));
    }
  }, []);

  useEffect(() => {
    if (isModelLoaded) {
      chatCompletion("Hello", "You are a friendly assistant.", setGreeting);
    } else {
      setGreeting("Hello lets create tasks");
    }
  }, [isModelLoaded]);

  //   useEffect(() => {
  //     console.log(board);
  //     debugger;
  //     localStorage.setItem("kanbanBoard", JSON.stringify(board));
  //   }, [board]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNewTaskChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value,
      column: INITIAL_COLUMNS[0].id,
      id: uuidv4(),
    });
  };

  const addTask = async () => {
    setIsLoading(true);
    closeModal();
    let subtasks = [];
    try {
      subtasks = await generateSubtasks(newTask.title);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return;
    }
    const parentTask = {
      id: `task-${uuidv4()}`,
      ...newTask,
    };
    const newTaskWithId = {
      ...parentTask,
      subtasks: subtasks.reduce((acc, subtask) => {
        const subTaskId = `subtask-${uuidv4()}`;
        acc[subTaskId] = {
          ...subtask,
          id: subTaskId,
          parentId: parentTask.id,
          column: INITIAL_COLUMNS[0].id,
        };
        return acc;
      }, {}),
    };
    const newBoard = {
      ...board,
      columns: {
        ...board.columns,
        backlog: {
          ...board.columns.backlog,
          tasks: {
            ...(board.columns.backlog?.tasks || {}),
            [parentTask.id]: parentTask,
            ...newTaskWithId.subtasks,
          },
        },
      },
    };
    setBoard(newBoard);
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      estimatedTime: "1 hour",
    });
    setIsLoading(false);
  };

  const updateTask = (columnId, taskId, updates) => {
    setBoard((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          tasks: {
            ...prev.columns[columnId].tasks,
            [taskId]: {
              ...prev.columns[columnId].tasks[taskId],
              ...updates,
            },
          },
        },
      },
    }));
  };

  const deleteTask = (columnId, taskId) => {
    const newTasks = { ...board.columns[columnId].tasks };
    delete newTasks[taskId];
    setBoard((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          tasks: newTasks,
        },
      },
    }));
  };

  const onDragEnd = (result) => {
    debugger;
    const { source, destination, type } = result;
    debugger;
    if (!destination) {
      return;
    }
    debugger;
    if (type === "TASK") {
      debugger;
      const sourceColumn = board.columns[source.droppableId];
      const destColumn = board.columns[destination.droppableId];
      const taskId = result.draggableId;

      const sourceTask = sourceColumn.tasks[taskId];
      const newSourceTasks = { ...sourceColumn.tasks };
      delete newSourceTasks[taskId];

      const newDestTasks = {
        ...destColumn.tasks,
        [taskId]: sourceTask,
      };

      setBoard((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [sourceColumn.id]: {
            ...sourceColumn,
            tasks: newSourceTasks,
          },
          [destColumn.id]: {
            ...destColumn,
            tasks: newDestTasks,
          },
        },
      }));
    }
  };
  const setProgressAndText = (
    text,
    progress = undefined,
    miliseconds = 500
  ) => {
    setTimeout(() => {
      setLoadingProgress(progress);
      setLoadingText(text);
    }, miliseconds);
  };
  const generateSubtasks = async (taskTitle) => {
    setIsGenerating(true);
    setProgressAndText("Generating subtasks...", 0, 0);
    const query = `${taskTitle}`;
    setProgressAndText("Validating Task...", 15);

    const validationResponse = await chatCompletionJSON(
      query,
      ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK
    );
    if (validationResponse.valid === false) {
      throw new Error(validationResponse.explain);
    }

    setProgressAndText("Done Validating task successfully!", 30);
    setProgressAndText("Initiating tasks thinking", 45);
    setProgressAndText("Writing tasks..", 50);
    let subtasks = [];
    try {
      subtasks = await chatCompletionJSON(
        query,
        ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON
      );
      setProgressAndText("Converting text tasks to JSON", 75);
    } catch (e) {
      throw new Error("Couldnt chatCompletionJSON Error" + e.message);
    }
    setProgressAndText("Converting tasks to JSON, successfully!", 100);
    setIsGenerating(false);
    setLoadingProgress(0);
    setLoadingText("");
    return subtasks;
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    setIsLoading(false);
    setLoadingProgress(0);
    setLoadingText("");
    setError("Task generation was cancelled.");
  };
  const getFlatTasksFromTaskRecursively = (task) => {
    const flatTasks = [];
    const stack = [task];

    while (stack.length) {
      const currentTask = stack.pop();
      flatTasks.push(currentTask);
      if (currentTask.subtasks) {
        for (const subtask of Object.values(currentTask.subtasks)) {
          stack.push({
            ...subtask,
            parentId: currentTask.id,
          });
        }
      }
    }

    return flatTasks;
  };
  const getTasks = useCallback(() => {
    const test = Object.entries(board.columns).reduce(
      (acc, [columnId, column]) => {
        const tasks = Object.values(column.tasks).reduce((taskAcc, task) => {
          const flatTasks = getFlatTasksFromTaskRecursively(task);
          taskAcc = [...taskAcc, ...flatTasks];
          return taskAcc;
        }, []);
        acc.push({
          id: columnId,
          title: column.title,
          tasks: tasks,
        });
        return acc;
      },
      []
    );
    return test;
  }, [board]);

  const tasksWithSubtasks = useMemo(() => getTasks(), [getTasks]);
  return (
    <div className="p-4 bg-green-50 min-h-screen">
      <div className={`${isLoading ? "z-depth-1" : ""}`}>
        <h1 className="text-3xl font-bold mb-4 text-green-800">
          {board.title}
        </h1>
        <p className="font-bold mb-4 text-green-800"> {greeting}</p>
      </div>
      <div className="mb-4 space-x-2">
        <button
          onClick={openModal}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300"
        >
          Add Task
        </button>
        <button
          onClick={saveBoardState}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300"
        >
          Save Board State
        </button>
        <button
          onClick={exportBoardState}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition duration-300"
        >
          Export Board
        </button>
        <input
          type="file"
          accept=".json"
          onChange={importBoardState}
          className="hidden"
          ref={fileInputRef}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition duration-300"
        >
          Import Board
        </button>
      </div>
      {isLoading && (
        <>
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
            <div className="relative pointer-events-auto bg-green-900 bg-opacity-50 p-4 rounded-lg">
              <LoadingIndicator
                // className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"
                percentage={loadingProgress}
                text={loadingText}
              />
            </div>
          </div>
          {isGenerating && (
            <button
              onClick={stopGeneration}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Stop Generation
            </button>
          )}
        </>
      )}
      {error && <p className="mt-4 text-red-500 font-semibold">{error}</p>}
      <Board
        columns={INITIAL_COLUMNS}
        tasks={tasksWithSubtasks}
        onEndDrop={onDragEnd}
        updateTask={updateTask} // Make sure to pass updateTask function
        deleteTask={deleteTask} // Make sure to pass deleteTask function
        handleFileUpload={handleFileUpload}
      />
      {/* <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {INITIAL_COLUMNS.map((column) => (
            <div
              key={column.id}
              className="bg-green-100 p-4 rounded-lg shadow-md min-w-[300px]"
            >
              <h2 className="font-bold mb-4 text-green-800">{column.title}</h2>
              <Droppable droppableId={column.id} type="TASK">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px]"
                  >
                    {tasksWithSubtasks.find(
                      (taskColumn) => taskColumn.id === column.id
                    )?.tasks === undefined
                      ? null
                      : tasksWithSubtasks
                          .find((taskColumn) => taskColumn.id === column.id)
                          .tasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided) => (
                                <TaskComponent
                                  task={task}
                                  columnId={column.id}
                                  updateTask={updateTask}
                                  deleteTask={deleteTask}
                                  handleFileUpload={handleFileUpload}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                />
                              )}
                            </Draggable>
                          ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext> */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4 text-green-800">
              Add New Task
            </h2>
            <input
              name="title"
              value={newTask.title}
              onChange={handleNewTaskChange}
              placeholder="Enter a task"
              className="w-full mb-4 p-2 border rounded"
            />
            <textarea
              name="description"
              value={newTask.description}
              onChange={handleNewTaskChange}
              placeholder="Description"
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="mb-4">
              <label className="block mb-2">Priority:</label>
              <select
                name="priority"
                value={newTask.priority}
                onChange={handleNewTaskChange}
                className="w-full p-2 border rounded"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <input
              name="estimatedTime"
              value={newTask.estimatedTime}
              onChange={handleNewTaskChange}
              placeholder="Estimated time (e.g., 2 hours, 1 day)"
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-r"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
