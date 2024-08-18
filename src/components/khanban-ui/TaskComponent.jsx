import React, { useState, useRef } from "react";
import { X } from "lucide-react";

const defaultColor = "#007AFF"; // Apple's blue

const TaskComponent = ({
  task,
  columnId,
  columnPrecent,
  updateTask,
  deleteTask,
  handleDragStart,
  handleDragOver,
  handleDrop,
  isDragging,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const fileInputRef = useRef(null);

  const getColor = () => {
    if (task.color) {
      return task.color.color;
    }
    return defaultColor;
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target.result;
          updateTask(columnId, task.id, {
            attachments: [
              ...(task.attachments || []),
              { name: file.name, data: base64String, type: file.type },
            ],
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOverLocal = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropLocal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload({ target: { files } });
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        handleFileUpload({ target: { files: [blob] } });
      }
    }
  };

  const openAttachmentPreview = (attachment) => {
    setPreviewAttachment(attachment);
  };

  const closeAttachmentPreview = () => {
    setPreviewAttachment(null);
  };

  const removeAttachment = (index) => {
    updateTask(columnId, task.id, {
      attachments: task.attachments.filter((_, i) => i !== index),
    });
  };

  return (
    <div
      className={`bg-white p-4 mb-3 rounded-xl shadow-sm transition-all duration-300 cursor-move
        ${isDragging ? "opacity-50" : ""}
        ${isHovered ? "shadow-md" : ""}
        ${columnId === "blocked" ? "border-l-4 border-red-500" : ""}
      `}
      style={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        border: "1px solid #E5E5EA", // Light gray border for visibility
      }}
      draggable
      onDragStart={(e) => handleDragStart(task, e)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPaste={handlePaste}
    >
      <div className="flex justify-between items-center mb-3">
        <input
          value={task.title}
          onChange={(e) =>
            updateTask(columnId, task.id, {
              title: e.target.value,
            })
          }
          style={{
            color: getColor(),
          }}
          className="font-semibold text-lg w-full mr-2 bg-transparent border-b border-transparent focus:border-blue-300 focus:outline-none transition-all duration-300"
        />
        <span className="text-xs text-gray-500">{task.estimatedTime}</span>
      </div>
      <div className="text-xs text-gray-500 mb-3">
        <strong>Main Task:</strong> {task.parentTitle || task.title}
      </div>
      <div className="text-sm text-gray-700 mb-3">
        Priority:
        <select
          value={task.priority}
          onChange={(e) =>
            updateTask(columnId, task.id, {
              priority: e.target.value,
            })
          }
          className="ml-2 bg-gray-100 rounded-md border-none focus:ring-2 focus:ring-blue-300 transition-all duration-300"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <div className="mb-3">
        <textarea
          value={task.description}
          onChange={(e) =>
            updateTask(columnId, task.id, { description: e.target.value })
          }
          placeholder="Task description"
          className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300"
          rows="3"
        ></textarea>
      </div>

      {/* Attachments Preview */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {task.attachments.map((attachment, index) => (
            <div
              key={index}
              className="relative group w-16 h-16 overflow-hidden rounded-lg shadow-sm"
            >
              {attachment.type && attachment.type.startsWith("image/") ? (
                <img
                  src={attachment.data}
                  alt={attachment.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openAttachmentPreview(attachment)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer"
                  onClick={() => openAttachmentPreview(attachment)}
                >
                  <span className="text-xs text-center break-words p-1">
                    {attachment.name}
                  </span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOverLocal}
        onDrop={handleDropLocal}
        onClick={() => fileInputRef.current.click()}
        className="border-2 border-dashed border-gray-200 p-4 rounded-lg mb-3 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
        />
        <p className="text-gray-500 text-sm">Add Attachments</p>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => deleteTask(columnId, task.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition-all duration-300"
        >
          Delete Task
        </button>

        {columnId === "blocked" ? (
          <div className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
            BLOCKED
          </div>
        ) : (
          <div className="w-1/2 bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                backgroundColor: getColor(),
                width: `${columnPrecent * 100}%`,
              }}
            ></div>
          </div>
        )}
      </div>

      {previewAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-3xl max-h-[90vh] overflow-auto">
            {previewAttachment.type &&
            previewAttachment.type.startsWith("image/") ? (
              <img
                src={previewAttachment.data}
                alt={previewAttachment.name}
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold mb-2">{previewAttachment.name}</h3>
                <p className="text-sm text-gray-600">
                  This file cannot be previewed. You can download it to view its
                  contents.
                </p>
                <a
                  href={previewAttachment.data}
                  download={previewAttachment.name}
                  className="mt-3 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm transition-all duration-300"
                >
                  Download
                </a>
              </div>
            )}
            <button
              onClick={closeAttachmentPreview}
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full text-sm transition-all duration-300"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskComponent;
