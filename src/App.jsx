// src/App.jsx
import React, { useState } from "react";
import ChatBot from "./components/ChatBot";
import StatusModel from "./components/StatusModel";
import TaskApp from "./components/TaskApp";
import Tab from "./components/Tab";

import {
  ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK,
  ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS,
  ASSISTANT_SYSTEM_PROMPT_TO_JSON,
} from "./system-prompt";

const App = () => {
  const [activeTab, setActiveTab] = useState("chatbot");

  return (
    <div className="App">
      <StatusModel />
      <div className="tabs">
        <Tab active={activeTab === "taskapp"} onClick={() => setActiveTab("taskapp")}>
          Task App
        </Tab>
        <Tab active={activeTab === "chatbot"} onClick={() => setActiveTab("chatbot")}>
          Chat Bot
        </Tab>
      </div>
      {activeTab === "taskapp" ? (
        <TaskApp />
      ) : (
        <ChatBot />
      )}
    </div>
  );
};

export default App;
