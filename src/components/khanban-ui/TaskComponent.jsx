import React, { useState } from "react";

const TaskComponent = ({
  task,
  columnId,
  updateTask,
  deleteTask,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleFileUpload,
  isDragging,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`bg-white p-3 mb-2 rounded shadow-sm transition-all duration-300 cursor-move
        ${isDragging ? "opacity-50" : ""}
        ${isHovered ? "shadow-md scale-105" : ""}
      `}
      draggable
      onDragStart={(e) => handleDragStart(task, e)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center mb-2">
        <input
          value={task.title}
          onChange={(e) =>
            updateTask(columnId, task.id, {
              title: e.target.value,
            })
          }
          className="font-semibold text-green-700 w-full mr-2 bg-transparent border-b border-transparent focus:border-green-300 focus:outline-none transition-all duration-300"
        />
        <span className="text-xs text-green-600">{task.estimatedTime}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2">
        <strong>Main Task:</strong> {task.parentTitle || task.title}
      </div>
      <div className="text-sm text-green-600 mb-2">
        Priority:
        <select
          value={task.priority}
          onChange={(e) =>
            updateTask(columnId, task.id, {
              priority: e.target.value,
            })
          }
          className="ml-2 bg-green-50 rounded border-none focus:ring-2 focus:ring-green-300 transition-all duration-300"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <textarea
        value={task.description}
        onChange={(e) =>
          updateTask(columnId, task.id, {
            description: e.target.value,
          })
        }
        className="w-full mb-2 text-sm bg-green-50 p-2 rounded resize-none focus:ring-2 focus:ring-green-300 focus:outline-none transition-all duration-300"
        placeholder="Description"
      />
      <input
        value={task.estimatedTime}
        onChange={(e) =>
          updateTask(columnId, task.id, {
            estimatedTime: e.target.value,
          })
        }
        className="w-full mb-2 text-sm bg-green-50 p-2 rounded focus:ring-2 focus:ring-green-300 focus:outline-none transition-all duration-300"
        placeholder="Estimated time (e.g., 2 hours, 1 day)"
      />
      <div className="mt-2">
        <h4 className="font-semibold text-sm text-green-700">Attachments:</h4>
        <input
          type="file"
          onChange={(e) => handleFileUpload(columnId, task.id, e)}
          className="text-xs cursor-pointer"
        />
        <ul className="list-disc list-inside">
          {task.attachments &&
            task.attachments.map((attachment, index) => (
              <li
                key={index}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-300"
              >
                <a href={attachment.data} download={attachment.name}>
                  {attachment.name}
                </a>
              </li>
            ))}
        </ul>
      </div>
      <button
        onClick={() => deleteTask(columnId, task.id)}
        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-all duration-300 mt-2"
      >
        Delete Task
      </button>
    </div>
  );
};

export default TaskComponent;
