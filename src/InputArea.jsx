import React, { useState } from "react";

function InputArea({ onSubmit }) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e, continuation = false) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    await onSubmit(input, continuation);
    setInput("");
    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    } else if (e.ctrlKey && e.key === "Enter") {
      handleSubmit(e, true);
    }
  };

  return (
    <div id="input-area" className="container p-0 card">
      <div className="input-group">
        <textarea
          id="user-input"
          className="form-control"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows="3"
        />
        <button
          id="send-button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default InputArea;
