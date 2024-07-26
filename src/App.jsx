// src/App.jsx
import React from "react";
import { useState } from 'react';
import ChatBot from "./components/ChatBot";
import StatusModel from "./components/StatusModel";
import TaskApp from "./components/TaskApp";

const App = () => {
  const [tab, setTab] = useState('task');

  return (
    <div className="App">
      <StatusModel />
      {tab === 'task' ? (
        <div>
          <TaskApp />
          <button onClick={() => setTab('chat')}>Switch to Chat</button>
          <button onClick={() => setTab('status')}>Switch to Status</button>
          <button onClick={() => setTab('home')}>Switch to Home</button>
        </div>
      ) : tab === 'chat' ? (
        <div>
          <ChatBot />
          <button onClick={() => setTab('task')}>Switch to Task</button>
          <button onClick={() => setTab('status')}>Switch to Status</button>
          <button onClick={() => setTab('home')}>Switch to Home</button>
        </div>
      ) : tab === 'status' ? (
        <div>
          <StatusModel />
          <button onClick={() => setTab('task')}>Switch to Task</button>
          <button onClick={() => setTab('chat')}>Switch to Chat</button>
          <button onClick={() => setTab('home')}>Switch to Home</button>
        </div>
      ) : tab === 'home' ? (
        <div>
          <h1>Welcome to the home page!</h1>
          <button onClick={() => setTab('task')}>Switch to Task</button>
          <button onClick={() => setTab('chat')}>Switch to Chat</button>
          <button onClick={() => setTab('status')}>Switch to Status</button>
        </div>
      ) : null}
    </div>
  );
};

export default App;
