import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import { useModel } from "../contexts/ModelContext";
import "./ChatBot.css";

marked.use({ mangle: false, headerIds: false });

const ChatBot = ({ chatHistory, setChatHistory, onSubmit, isGenerating }) => {
  const { isModelLoaded } = useModel();
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
    if (!isModelLoaded) {
      return "Loading model...";
    }
    return isGenerating ? "Generating..." : "Send";
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
          disabled={isGenerating || !isModelLoaded}
        />
        <button type="submit" disabled={isGenerating || !isModelLoaded}>
          {getButtonMessage()}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
