import React, { useEffect, useRef } from "react";

function ChatHistory({ history }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [history]);

  return (
    <div id="scroll-wrapper">
      <div id="chat-container" className="card">
        <div className="card-body">
          <div id="chat-history">
            {history.map((message, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  message.type === "user" ? "user-message" : "response-message"
                }`}
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
            ))}
          </div>
          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  );
}

export default ChatHistory;
