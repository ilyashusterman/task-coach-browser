// src/App.jsx
import React, { useState, useRef, useEffect } from "react";
import ChatBot from "./components/ChatBot";
import ModelSettingsEditor from "./components/ModelSettingsEditor";
import {
  ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
  ASSISTANT_SYSTEM_PROMPT_TO_JSON,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON,
} from "./system-prompt";
import { useModel } from "./contexts/ModelContext";
import SystemPromptEditor from "./components/SystemPromptEditor";
import KanbanBoard from "./components/KhanbanBoard";
import AppBarMenu from "./components/AppBarMenu";
import Footer from "./components/Footer";
import HuggingFaceComponent from "./components/HuggingFaceComponent";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState(
    ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK
  );
  const {
    isModelLoaded,
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
    <div className="flex flex-col min-h-screen">
      <AppBarMenu setActiveTab={setActiveTab} activeTab={activeTab} />
      <ModelSettingsEditor />
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
          <div className="flex-grow"></div>
          <Footer />
        </div>
        <div className={activeTab === "huggingface" ? "" : "hidden"}>
          <HuggingFaceComponent />
        </div>
      </div>
    </div>
  );
};

export default App;
