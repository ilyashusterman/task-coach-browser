import React, { useState } from "react";
import { ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import {
  ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
  ASSISTANT_SYSTEM_PROMPT_TO_JSON,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
  ASSISTANT_SYSTEM_PROMPT_GENERATE_TASK,
} from "../system-prompt";

const SystemPromptEditor = ({ systemPrompt, setSystemPrompt }) => {
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("validate");
  const [currentPrompt, setCurrentPrompt] = useState(systemPrompt);

  const prompts = {
    validate: ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
    writeTasks: ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
    toJson: ASSISTANT_SYSTEM_PROMPT_TO_JSON,
    writeTasksJson: ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
    generateTaskJson: ASSISTANT_SYSTEM_PROMPT_GENERATE_TASK,
  };

  const handlePromptChange = (event) => {
    const value = event.target.value;
    setSelectedPrompt(value);
    setCurrentPrompt(prompts[value]);
    setSystemPrompt(prompts[value]);
  };

  const handleInputChange = (event) => {
    const newPrompt = event.target.value;
    setCurrentPrompt(newPrompt);
    setSystemPrompt(newPrompt);
  };

  const toggleEditorVisibility = () => {
    setIsEditorVisible(!isEditorVisible);
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">
      <button
        onClick={toggleEditorVisibility}
        className="mb-4 w-full flex justify-between items-center bg-gray-800 hover:bg-gray-700 p-2 rounded-md transition-colors duration-200"
      >
        <span className="flex items-center">
          <Edit2 className="mr-2" size={18} />
          System Prompt Editor
        </span>
        {isEditorVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isEditorVisible && (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="prompt-select" className="text-sm font-medium">
              Select Prompt:
            </label>
            <select
              id="prompt-select"
              value={selectedPrompt}
              onChange={handlePromptChange}
              className="bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="validate">Validate Task</option>
              <option value="writeTasks">Write Tasks</option>
              <option value="toJson">To JSON</option>
              <option value="writeTasksJson">Write Tasks JSON</option>
              <option value="generateTaskJson">Generate Task JSON</option>
            </select>
          </div>

          <textarea
            value={currentPrompt}
            onChange={handleInputChange}
            className="w-full min-h-[200px] bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your system prompt here..."
          />
        </div>
      )}
    </div>
  );
};

export default SystemPromptEditor;
