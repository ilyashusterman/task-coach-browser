import { v4 as uuidv4 } from "uuid";
import { encoding_for_model } from "@dqbd/tiktoken";
import {
  ASSISTANT_SYSTEM_PROMPT_GENERATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
} from "../../system-prompt";

export function generateColor() {
  const colors = {
    slate: [
      "#f8fafc",
      "#f1f5f9",
      "#e2e8f0",
      "#cbd5e1",
      "#94a3b8",
      "#64748b",
      "#475569",
      "#334155",
      "#1e293b",
      "#0f172a",
    ],
    gray: [
      "#f9fafb",
      "#f3f4f6",
      "#e5e7eb",
      "#d1d5db",
      "#9ca3af",
      "#6b7280",
      "#4b5563",
      "#374151",
      "#1f2937",
      "#111827",
    ],
    zinc: [
      "#fafafa",
      "#f4f4f5",
      "#e4e4e7",
      "#d4d4d8",
      "#a1a1aa",
      "#71717a",
      "#52525b",
      "#3f3f46",
      "#27272a",
      "#18181b",
    ],
    neutral: [
      "#fafafa",
      "#f5f5f5",
      "#e5e5e5",
      "#d4d4d4",
      "#a3a3a3",
      "#737373",
      "#525252",
      "#404040",
      "#262626",
      "#171717",
    ],
    stone: [
      "#fafaf9",
      "#f5f5f4",
      "#e7e5e4",
      "#d6d3d1",
      "#a8a29e",
      "#78716c",
      "#57534e",
      "#44403c",
      "#292524",
      "#1c1917",
    ],
    red: [
      "#fef2f2",
      "#fee2e2",
      "#fecaca",
      "#fca5a5",
      "#f87171",
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
    ],
    orange: [
      "#fff7ed",
      "#ffedd5",
      "#fed7aa",
      "#fdba74",
      "#fb923c",
      "#f97316",
      "#ea580c",
      "#c2410c",
      "#9a3412",
      "#7c2d12",
    ],
    amber: [
      "#fffbeb",
      "#fef3c7",
      "#fde68a",
      "#fcd34d",
      "#fbbf24",
      "#f59e0b",
      "#d97706",
      "#b45309",
      "#92400e",
      "#78350f",
    ],
    yellow: [
      "#fefce8",
      "#fef9c3",
      "#fef08a",
      "#fde047",
      "#facc15",
      "#eab308",
      "#ca8a04",
      "#a16207",
      "#854d0e",
      "#713f12",
    ],
    lime: [
      "#f7fee7",
      "#ecfccb",
      "#d9f99d",
      "#bef264",
      "#a3e635",
      "#84cc16",
      "#65a30d",
      "#4d7c0f",
      "#3f6212",
      "#365314",
    ],
    green: [
      "#f0fdf4",
      "#dcfce7",
      "#bbf7d0",
      "#86efac",
      "#4ade80",
      "#22c55e",
      "#16a34a",
      "#15803d",
      "#166534",
      "#14532d",
    ],
    emerald: [
      "#ecfdf5",
      "#d1fae5",
      "#a7f3d0",
      "#6ee7b7",
      "#34d399",
      "#10b981",
      "#059669",
      "#047857",
      "#065f46",
      "#064e3b",
    ],
    teal: [
      "#f0fdfa",
      "#ccfbf1",
      "#99f6e4",
      "#5eead4",
      "#2dd4bf",
      "#14b8a6",
      "#0d9488",
      "#0f766e",
      "#115e59",
      "#134e4a",
    ],
    cyan: [
      "#ecfeff",
      "#cffafe",
      "#a5f3fc",
      "#67e8f9",
      "#22d3ee",
      "#06b6d4",
      "#0891b2",
      "#0e7490",
      "#155e75",
      "#164e63",
    ],
    sky: [
      "#f0f9ff",
      "#e0f2fe",
      "#bae6fd",
      "#7dd3fc",
      "#38bdf8",
      "#0ea5e9",
      "#0284c7",
      "#0369a1",
      "#075985",
      "#0c4a6e",
    ],
    blue: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#1e3a8a",
    ],
    indigo: [
      "#eef2ff",
      "#e0e7ff",
      "#c7d2fe",
      "#a5b4fc",
      "#818cf8",
      "#6366f1",
      "#4f46e5",
      "#4338ca",
      "#3730a3",
      "#312e81",
    ],
    violet: [
      "#f5f3ff",
      "#ede9fe",
      "#ddd6fe",
      "#c4b5fd",
      "#a78bfa",
      "#8b5cf6",
      "#7c3aed",
      "#6d28d9",
      "#5b21b6",
      "#4c1d95",
    ],
    purple: [
      "#faf5ff",
      "#f3e8ff",
      "#e9d5ff",
      "#d8b4fe",
      "#c084fc",
      "#a855f7",
      "#9333ea",
      "#7e22ce",
      "#6b21a8",
      "#581c87",
    ],
    fuchsia: [
      "#fdf4ff",
      "#fae8ff",
      "#f5d0fe",
      "#f0abfc",
      "#e879f9",
      "#d946ef",
      "#c026d3",
      "#a21caf",
      "#86198f",
      "#701a75",
    ],
    pink: [
      "#fdf2f8",
      "#fce7f3",
      "#fbcfe8",
      "#f9a8d4",
      "#f472b6",
      "#ec4899",
      "#db2777",
      "#be185d",
      "#9d174d",
      "#831843",
    ],
    rose: [
      "#fff1f2",
      "#ffe4e6",
      "#fecdd3",
      "#fda4af",
      "#fb7185",
      "#f43f5e",
      "#e11d48",
      "#be123c",
      "#9f1239",
      "#881337",
    ],
  };

  const colorNames = Object.keys(colors);
  const randomColorName =
    colorNames[Math.floor(Math.random() * colorNames.length)];
  const randomColorShades = colors[randomColorName];
  const randomColor =
    randomColorShades[Math.floor(Math.random() * randomColorShades.length)];

  return {
    color: randomColor,
    shade: randomColorName,
  };
}

export async function getTokenCount(text, model = "gpt-4") {
  const encoder = await encoding_for_model(model);
  const tokens = encoder.encode(text);
  const tokenCount = tokens.length;
  encoder.free(); // Important: Free up the memory when done
  return tokenCount;
}

export const INITIAL_COLUMNS = [
  { id: "backlog", title: "Backlog", tasks: {} },
  { id: "todo", title: "To Do", tasks: {} },
  { id: "in-progress", title: "In Progress", tasks: {} },
  { id: "review", title: "Review", tasks: {} },
  { id: "done", title: "Done", tasks: {} },
  { id: "blocked", title: "Blocked", tasks: {} },
];

export const generateTaskObject = ({
  id = undefined,
  color = undefined,
  ...props
} = {}) => {
  return {
    id: id === undefined ? uuidv4() : id,
    estimatedTime: "1 hour",
    title: "",
    description: "",
    assignee: undefined,
    column: INITIAL_COLUMNS[0].id,
    attachments: undefined,
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
    startedTime: undefined,
    completedTime: undefined,
    color: color === undefined ? generateColor() : color,
    priority: "Medium",
    comments: undefined,
    tags: undefined,
    ...props,
  };
};

export const saveBoardState = (board) => {
  localStorage.setItem("kanbanBoard", JSON.stringify(board));
};

export const exportBoardState = (board) => {
  const dataStr =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(board));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "kanban_board_export.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importBoardState = (event, setBoard) => {
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

export const validateTask = async (
  task,
  chatCompletionJSON,
  setProgressAndText
) => {
  const prompt = `${task.title}${
    task.description == "" ? "" : "\nDescription:" + task.description
  }`;

  if (!task.bypassValidation) {
    setProgressAndText("Validating task...", 15);
    const validationResponse = await chatCompletionJSON(
      prompt,
      ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK
    );
    if (validationResponse.valid === false) {
      throw new Error(validationResponse.explain);
    }
    setProgressAndText("Done Validating task successfully!", 30);
  }
};

export const generateSubtasks = async (
  task,
  chatCompletionJSON,
  setProgressAndText
) => {
  const taskTitle = task.title;
  setProgressAndText("Generating subtasks...", 0, 0);
  const query = `${taskTitle}`;
  setProgressAndText("Initiating tasks thinking", 45);
  let subtasks = [];
  try {
    subtasks = await chatCompletionJSON(
      query,
      ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
      3,
      console.log
    );
    setProgressAndText("Converting text tasks to JSON", 65);
  } catch (e) {
    throw new Error("Couldn't chatCompletionJSON Error" + e.message);
  }
  setProgressAndText("Converting tasks to JSON, successfully!", 75);
  return subtasks;
};

export const generateTask = async (task, chatCompletionJSON) => {
  const prompt = `${task.title}${
    task.description == "" ? "" : "\nDescription:" + task.description
  }`;
  const taskResponse = await chatCompletionJSON(
    prompt,
    ASSISTANT_SYSTEM_PROMPT_GENERATE_TASK
  );
  return {
    ...task,
    ...taskResponse,
  };
};

export const getFlatTasksFromTaskRecursively = (task) => {
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
