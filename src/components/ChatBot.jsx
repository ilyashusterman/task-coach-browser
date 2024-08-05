import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";

import "./ChatBot.css";
import { useModel } from "../contexts/ModelContext";

marked.use({ mangle: false, headerIds: false });

const ChatBot = ({
  chatHistory,
  setChatHistory,
  onSubmit,
  isGenerating,
  abortWorker,
}) => {
  const { isModelLoaded, apiUrlBaseLLM, modelApi } = useModel();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    if (isGenerating) {
      setInput("");
      return;
    }
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: input },
      { role: "assistant", content: ".." },
    ]);
    onSubmit(input);
    setInput("");
  };
  const getButtonMessage = () => {
    if (modelApi !== "" && apiUrlBaseLLM !== "") {
      return "Send";
    }
    if (!isModelLoaded && modelApi === "" && apiUrlBaseLLM === "") {
      return "Loading model...";
    }
    return isGenerating ? "Generating..." : "Send";
  };
  const isDisabled = () => {
    if (modelApi !== "" && apiUrlBaseLLM !== "") {
      return false;
    }

    return isGenerating || !isModelLoaded;
  };
  return (
    <div className="chat-container">
      <div className="chat-history">
        {chatHistory.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div
              dangerouslySetInnerHTML={{ __html: marked(message.content) }}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isDisabled()}
        />
        <button type="submit" disabled={isDisabled()}>
          {getButtonMessage()}
        </button>

        <button onClick={abortWorker}>Abort</button>
      </form>
    </div>
  );
};

export default ChatBot;
