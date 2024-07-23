import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";

const ChatInterface = ({
  chatHistory,
  setChatHistory,
  onSubmit,
  isGenerating,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    setChatHistory((prev) => [...prev, { role: "user", content: input }]);
    onSubmit(input);
    setInput("");
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
          disabled={isGenerating}
        />
        <button type="submit" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
