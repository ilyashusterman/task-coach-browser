// src/components/TaskApp.jsx
import React, { useState, useRef } from "react";
import ChatBot from "./ChatBot";
import StatusModel from "./StatusModel";

import {
  ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
  ASSISTANT_SYSTEM_PROMPT_TO_JSON,
} from "../system-prompt";

const TaskApp = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState(
    ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const worker = useRef(null);

  const chatCompletion = async (query) => {
    setIsGenerating(true);
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
        name: "ChatCompletion",
      });
    }
    worker.current.postMessage({
      query,
      systemPrompt,
      stream: true,
    });
    const finalText = await new Promise((resolve) => {
      worker.current.onmessage = (event) => {
        const { status, text } = event.data;
        if (status === "final") {
          setChatHistory((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: text },
          ]);
          worker.current.terminate();
          resolve(text);
        }
        if (status === "stream") {
          setChatHistory((prev) => [
            ...prev.slice(0, -1),
            { ...prev[prev.length - 1], role: "assistant", content: text },
          ]);
        }
      };
    });

    return finalText;
  };

  return (
    <div className="TaskApp">
      <StatusModel />
      <ChatBot
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        onSubmit={chatCompletion}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default TaskApp;
