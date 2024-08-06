import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import LoadingIndicator from "./LoadingIndicator";
import {
  ASSISTANT_SYSTEM_PROMPT_TO_JSON,
  ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
  ASSISTANT_SYSTEM_PROMPT_GENERATE_TASK,
} from "../system-prompt";
import { useModel } from "../contexts/ModelContext";
import Board from "./khanban-ui/Board";

const INITIAL_COLUMNS = [
  { id: "backlog", title: "Backlog", tasks: {} },
  { id: "todo", title: "To Do", tasks: {} },
  { id: "in-progress", title: "In Progress", tasks: {} },
  { id: "review", title: "Review", tasks: {} },
  { id: "done", title: "Done", tasks: {} },
  { id: "blocked", title: "Blocked", tasks: {} },
];

const KanbanBoard = () => {
  const { chatCompletion, chatCompletionJSON, isModelLoaded, useAPI } =
    useModel();
  const [board, setBoardBase] = useState({
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
    bypassValidation: false,
    generateSubtasks: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const saveBoardState = (saveBoard = undefined) => {
    localStorage.setItem("kanbanBoard", JSON.stringify(saveBoard || board));
  };
  const setBoard = (board) => {
    saveBoardState(board);
    return setBoardBase(board);
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

    if (savedBoard && savedBoard !== "undefined") {
      const parsedBoard = JSON.parse(savedBoard);
      setBoardBase(parsedBoard);
    } else {
      // Initialize with default columns
      const initialColumns = INITIAL_COLUMNS.reduce((acc, column) => {
        acc[column.id] = { id: column.id, title: column.title, tasks: {} };
        return acc;
      }, {});
      setBoard((prev) => ({ ...prev, columns: initialColumns }));
    }
  }, []);

  useEffect(() => {
    if (isModelLoaded || useAPI) {
      chatCompletion("Hello", "You are a friendly assistant.", setGreeting);
    } else {
      setGreeting("Hello lets create tasks");
    }
  }, [isModelLoaded]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNewTaskChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setNewTask({
      ...newTask,
      [e.target.name]: value,
      column: INITIAL_COLUMNS[0].id,
      id: uuidv4(),
    });
  };
  const addTask = async () => {
    setIsLoading(true);
    closeModal();
    setIsGenerating(true);
    let describedTask;
    let subtasks = [];
    try {
      await validateTask(newTask);

      if (newTask.generateSubtasks) {
        subtasks = await generateSubtasks(newTask);
        // if subtasks is a object then add it to array
        if (typeof subtasks === "object") {
          subtasks = [subtasks];
        }
      }

      describedTask = await generateTask(newTask);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return;
    }
    setIsGenerating(false);
    const parentTask = {
      id: `task-${uuidv4()}`,
      ...describedTask,
      isParent: true,
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
          parentTitle: newTask.title,
        };
        return acc;
      }, {}),
    };
    setBoard({
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
    });
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      estimatedTime: "1 hour",
    });
    setIsLoading(false);
  };

  const updateTask = (columnId, taskId, updates) => {
    setBoard({
      ...board,
      columns: {
        ...board.columns,
        [columnId]: {
          ...board.columns[columnId],
          tasks: {
            ...board.columns[columnId].tasks,
            [taskId]: {
              ...board.columns[columnId].tasks[taskId],
              ...updates,
            },
          },
        },
      },
    });
  };

  const deleteTask = (columnId, taskId) => {
    const newTasks = { ...board.columns[columnId].tasks };
    delete newTasks[taskId];

    setBoard({
      ...board,
      columns: {
        ...board.columns,
        [columnId]: {
          ...board.columns[columnId],
          tasks: newTasks,
        },
      },
    });
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
  const generateSubtasks = async (task) => {
    const taskTitle = task.title;
    setProgressAndText("Generating subtasks...", 0, 0);
    const query = `${taskTitle}`;
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
    setLoadingProgress(0);
    setLoadingText("");
    return subtasks;
  };
  async function validateTask(task) {
    const prompt = `${task.title}${
      task.description == "" ? "" : "\nDescription:" + task.description
    }`;
    setProgressAndText("Validating Task...", 15);
    if (!task.bypassValidation) {
      const validationResponse = await chatCompletionJSON(
        prompt,
        ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK
      );
      if (validationResponse.valid === false) {
        throw new Error(validationResponse.explain);
      }
    }
  }
  const generateTask = async (task) => {
    const prompt = `${task.title}${
      task.description == "" ? "" : "\nDescription:" + task.description
    }`;
    setProgressAndText("Generating task..", 90);
    const taskResponse = await chatCompletionJSON(
      prompt,
      ASSISTANT_SYSTEM_PROMPT_GENERATE_TASK
    );
    return {
      ...task,
      ...taskResponse,
    };
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
    return Object.entries(board.columns).reduce((acc, [columnId, column]) => {
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
    }, []);
  }, [board]);

  const tasksWithSubtasks = useMemo(() => getTasks(), [getTasks]);

  const updateBoardTasks = (tasks) => {
    const newBoard = {
      id: board.id,
      title: board.title,
      columns: {},
    };

    tasks.forEach((column) => {
      newBoard.columns[column.id] = {
        id: column.id,
        title: column.title,
        tasks: {},
      };

      column.tasks.forEach((task) => {
        newBoard.columns[column.id].tasks[task.id] = {
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimatedTime: task.estimatedTime,
          column: task.column,
          parentId: task.parentId,
          ...task,
        };
      });
    });
    setBoard(newBoard);
    saveBoardState(newBoard);
  };
  return (
    <div className="p-4 bg-green-50 min-h-screen">
      <div className={`${isLoading ? "z-depth-1" : ""}`}>
        <h1 className="text-3xl font-bold mb-4 text-green-800">
          <input
            value={board.title}
            onChange={(e) =>
              setBoard({
                ...board,
                title: e.target.value,
              })
            }
            className="text-3xl font-bold mb-4 text-green-800 w-full mr-2 bg-transparent border-b border-transparent focus:border-green-300 focus:outline-none transition-all duration-300"
          />
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
          onClick={() => saveBoardState()}
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
        setTasks={updateBoardTasks}
        updateTask={updateTask} // Make sure to pass updateTask function
        deleteTask={deleteTask} // Make sure to pass deleteTask function
        handleFileUpload={handleFileUpload}
      />
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
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="bypassValidation"
                  checked={newTask.bypassValidation}
                  onChange={handleNewTaskChange}
                  className="mr-2"
                />
                Bypass Validation
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="generateSubtasks"
                  checked={newTask.generateSubtasks}
                  onChange={handleNewTaskChange}
                  className="mr-2"
                />
                <span className="relative flex items-center">
                  Generate Subtasks
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    New!
                  </span>
                </span>
              </label>
            </div>
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
