// src/App.jsx
import React from "react";
import { useState } from 'react';
import ChatBot from "./components/ChatBot";
import StatusModel from "./components/StatusModel";
import TaskApp from "./components/TaskApp";

const App = () => {
  const [tab, setTab] = useState('chat');

  return (
    <div className="App">
      <StatusModel />
      {tab === 'chat' ? (
        <div>
          <ChatBot />
          <button onClick={() => setTab('task')}>Switch to Task</button>
        </div>
      ) : (
        <div>
          <TaskApp />
          <button onClick={() => setTab('chat')}>Switch to Chat</button>
        </div>
      )}
    </div>
  );
};

export default App;
