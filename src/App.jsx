// src/App.jsx
import React, { useState, useRef, useEffect } from "react";
import ChatBot from "./components/ChatBot";
import StatusModel from "./components/StatusModel";
import {
  ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
  ASSISTANT_SYSTEM_PROMPT_TO_JSON,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
} from "./system-prompt";
import { useModel } from "./contexts/ModelContext";
import SystemPromptEditor from "./components/SystemPromptEditor";
import KanbanBoard from "./components/KhanbanBoard";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState(
    ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK
  );
  const {
    isModelLoaded,
    progress,
    chatCompletion: chatCompletionBase,
    abortWorker,
  } = useModel();

  const [isGenerating, setIsGenerating] = useState(false);

  const chatCompletion = async (
    query,
    systemPromptQuery = undefined,
    callBackUpdate = undefined
  ) => {
    while (isGenerating) {
      // wait for 1 seconds
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const prompt = systemPromptQuery || systemPrompt;
    try {
      const finalText = await chatCompletionBase(query, prompt, (text) => {
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: text },
        ]);
        if (callBackUpdate) {
          callBackUpdate(text);
        }
      });
      return finalText;
    } catch (e) {
      setIsGenerating(false);
      throw e;
    }
  };

  const [activeTab, setActiveTab] = useState("kanban");

  return (
    <div className="app">
      <StatusModel isModelLoaded={isModelLoaded} progress={progress} />
      <div className="tabs">
        <button
          className={`tab ${activeTab === "kanban" ? "active" : ""}`}
          onClick={() => setActiveTab("kanban")}
        >
          Kanban
        </button>
        <button
          className={`tab ${activeTab === "debugger" ? "active" : ""}`}
          onClick={() => setActiveTab("debugger")}
        >
          Debugger
        </button>
      </div>
      <div className="tab-content">
        <div className={activeTab === "kanban" ? "" : "hidden"}>
          <KanbanBoard />
        </div>
        <div className={activeTab === "debugger" ? "" : "hidden"}>
          <SystemPromptEditor
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
          />
          <ChatBot
            isModelLoaded={isModelLoaded}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            onSubmit={chatCompletion}
            isGenerating={isGenerating}
            abortWorker={abortWorker}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
