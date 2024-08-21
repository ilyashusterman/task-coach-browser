import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";

import LoadingIndicator from "./LoadingIndicator";
import { useModel } from "../contexts/ModelContext";
import Board from "./khanban-ui/Board";
import {
  getTokenCount,
  INITIAL_COLUMNS,
  generateTaskObject,
  saveBoardState,
  exportBoardState,
  importBoardState,
  validateTask,
  generateSubtasks,
  generateTask,
  getFlatTasksFromTaskRecursively,
} from "./utils/task-helpers";

const MAX_TOKENS = 15;

const KanbanBoard = () => {
  const { chatCompletion, chatCompletionJSON, canUseChatCompletion } =
    useModel();
  const [board, setBoardBase] = useState({
    id: "board-1",
    title: "My Inspired Kanban",
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
    ...generateTaskObject(),
    bypassValidation: false,
    generateSubtasks: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const setBoard = (board) => {
    saveBoardState(board);
    return setBoardBase(board);
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
      const initialColumns = INITIAL_COLUMNS.reduce((acc, column) => {
        acc[column.id] = { id: column.id, title: column.title, tasks: {} };
        return acc;
      }, {});
      setBoard((prev) => ({ ...prev, columns: initialColumns }));
    }
  }, []);

  useEffect(() => {
    if (canUseChatCompletion) {
      chatCompletion("Hello", "You are a friendly assistant.", setGreeting);
    } else {
      setGreeting("Hello, let's create tasks");
    }
  }, [canUseChatCompletion]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNewTaskChange = async (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    let updatedTask = {
      ...newTask,
      [e.target.name]: value,
      column: INITIAL_COLUMNS[0].id,
      id: uuidv4(),
    };

    if (e.target.name === "title" || e.target.name === "description") {
      const tokenCount = await getTokenCount(value);
      if (tokenCount > MAX_TOKENS) {
        return; // Don't update if token limit is exceeded
      }
      updatedTask[`${e.target.name}Tokens`] = tokenCount;
    }
    setNewTask(updatedTask);
  };

  const addTask = async () => {
    setIsLoading(true);
    closeModal();
    setIsGenerating(true);
    let describedTask;
    let subtasks = [];
    try {
      await validateTask(newTask, chatCompletionJSON, setProgressAndText);

      if (newTask.generateSubtasks) {
        subtasks = await generateSubtasks(
          newTask,
          chatCompletionJSON,
          setProgressAndText
        );
        if (!Array.isArray(subtasks)) {
          subtasks = [subtasks];
        }
      }

      describedTask = await generateTask(newTask, chatCompletionJSON);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return;
    }
    setIsGenerating(false);
    const parentTask = {
      ...generateTaskObject(),
      ...describedTask,
      id: `task-${uuidv4()}`,
      isParent: true,
    };
    const newTaskWithId = {
      ...parentTask,
      subtasks: subtasks.reduce((acc, subtask) => {
        const subTaskId = `subtask-${uuidv4()}`;
        acc[subTaskId] = {
          ...generateTaskObject({
            color: parentTask.color,
            id: subTaskId,
          }),
          ...subtask,
          parentId: parentTask.id,
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
    setNewTask(generateTaskObject());
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
    milliseconds = 500
  ) => {
    setTimeout(() => {
      setLoadingProgress(progress);
      setLoadingText(text);
    }, milliseconds);
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    setIsLoading(false);
    setLoadingProgress(0);
    setLoadingText("");
    setError("Task generation was cancelled.");
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
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div
        className={`${
          isLoading ? "opacity-50" : ""
        } transition-opacity duration-300`}
      >
        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          <input
            value={board.title}
            onChange={(e) => setBoard({ ...board, title: e.target.value })}
            className="w-full mr-2 bg-transparent border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300"
          />
        </h1>
        <p className="font-medium mb-8 text-gray-600">{greeting}</p>
      </div>
      <div className="mb-8 space-x-4">
        <button
          onClick={openModal}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition duration-300 shadow-sm"
        >
          Create Task
        </button>
        <button
          onClick={() => exportBoardState(board)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-full transition duration-300 shadow-sm"
        >
          Export Board
        </button>
        <input
          type="file"
          accept=".json"
          onChange={(e) => importBoardState(e, setBoard)}
          className="hidden"
          ref={fileInputRef}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-full transition duration-300 shadow-sm"
        >
          Import Board
        </button>
      </div>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <LoadingIndicator percentage={loadingProgress} text={loadingText} />
          </div>
        </div>
      )}
      {isGenerating && (
        <button
          onClick={stopGeneration}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-sm"
        >
          Stop Generation
        </button>
      )}
      {error && <p className="mt-6 text-red-500 font-semibold">{error}</p>}
      <Board
        columns={INITIAL_COLUMNS}
        tasks={tasksWithSubtasks}
        setTasks={updateBoardTasks}
        updateTask={updateTask}
        deleteTask={deleteTask}
        handleFileUpload={handleFileUpload}
      />
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Add New Task
            </h2>
            <input
              name="title"
              value={newTask.title}
              onChange={handleNewTaskChange}
              placeholder="Prompt"
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mb-4">
              Title Tokens: {newTask.titleTokens}/{MAX_TOKENS}
            </p>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">Priority:</label>
              <select
                name="priority"
                value={newTask.priority}
                onChange={handleNewTaskChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mb-4">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  name="bypassValidation"
                  checked={newTask.bypassValidation}
                  onChange={handleNewTaskChange}
                  className="mr-2 h-5 w-5 text-blue-500 rounded focus:ring-blue-500"
                />
                Bypass Validation
              </label>
            </div>
            <div className="mb-6">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  name="generateSubtasks"
                  checked={newTask.generateSubtasks}
                  onChange={handleNewTaskChange}
                  className="mr-2 h-5 w-5 text-blue-500 rounded focus:ring-blue-500"
                />
                <span className="relative flex items-center">
                  Generate Subtasks
                  <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full animate-pulse">
                    New!
                  </span>
                </span>
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
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
