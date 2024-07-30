import React, { useState } from "react";
import {
  ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
  ASSISTANT_SYSTEM_PROMPT_TO_JSON,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
} from "../system-prompt";

const SystemPromptEditor = ({ systemPrompt, setSystemPrompt }) => {
  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(systemPrompt);
  const [currentPrompt, setCurrentPrompt] = useState(systemPrompt);

  const prompts = {
    validate: ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
    writeTasks: ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
    toJson: ASSISTANT_SYSTEM_PROMPT_TO_JSON,
    writeTasksJson: ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
  };

  const handlePromptChange = (event) => {
    const selected = event.target.value;
    setSelectedPrompt(selected);
    setCurrentPrompt(prompts[selected]);
    setSystemPrompt(prompts[selected]);
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
    <div>
      <button onClick={toggleEditorVisibility}>
        {isEditorVisible ? "Hide Editor" : "Show Editor"}
      </button>

      {isEditorVisible && (
        <div>
          <label htmlFor="prompt-select">Select Prompt:</label>
          <select
            id="prompt-select"
            value={selectedPrompt}
            onChange={handlePromptChange}
          >
            <option value="validate">Validate Task</option>
            <option value="writeTasks">Write Tasks</option>
            <option value="toJson">To JSON</option>
            <option value="writeTasksJson">Write Tasks JSON</option>
          </select>

          <textarea
            value={currentPrompt}
            onChange={handleInputChange}
            rows="10"
            cols="50"
          />

          <div>
            <h3>Current Prompt:</h3>
            <pre>{currentPrompt}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemPromptEditor;
