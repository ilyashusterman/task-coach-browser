// src/App.jsx
import React, { useState } from "react";
import { useModel } from "./contexts/ModelContext";
import ChatInterface from "./components/ChatInterface";
import ModelLoader from "./components/ModelLoader";
import "./App.css";

const App = () => {
  const { llm, tokenizer, isModelLoaded } = useModel();
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "You are a friendly assistant." },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (query, isContinuation = false) => {
    if (!tokenizer || !llm) return;

    setIsGenerating(true);
    // const messages = [...chatHistory, { role: "user", content: query }];
    // const text = tokenizer
    //   .apply_chat_template(messages, {
    //     tokenize: false,
    //     add_generation_prompt: true,
    //   })
    //   .replace("<s>", "<|system|>");
    // const { input_ids } = tokenizer(text, {
    //   return_tensor: false,
    //   padding: true,
    //   truncation: true,
    // });

    let prompt = isContinuation
      ? query
      : `<|system|>\nYou are a friendly assistant.<|end|>\n<|user|>\n${query}<|end|>\n<|assistant|>\n`;

    const { input_ids } = await tokenizer(prompt, {
      return_tensor: false,
      padding: true,
      truncation: true,
    });
    llm.initilize_feed();

    const start_timer = performance.now();
    const output_index = llm.output_tokens.length + input_ids.length;

    const output_tokens = await llm.generate(
      input_ids,
      (output_tokens) => {
        const newText = token_to_text(tokenizer, output_tokens, output_index);
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          { ...prev[prev.length - 1], content: newText },
        ]);
      },
      { max_tokens: 500 }
    );

    const took = (performance.now() - start_timer) / 1000;
    console.log(
      `time to first token in ${took.toFixed(1)}sec, ${input_ids.length} tokens`
    );
    const finalText = token_to_text(tokenizer, output_tokens, output_index);
    setChatHistory((prev) => [
      ...prev.slice(0, -1),
      { role: "assistant", content: finalText },
    ]);
    setIsGenerating(false);
  };

  const token_to_text = (tokenizer, tokens, startidx) => {
    return tokenizer.decode(tokens.slice(startidx), {
      skip_special_tokens: true,
    });
  };

  return (
    <div className="App">
      <ModelLoader isLoaded={isModelLoaded} />
      <ChatInterface
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        onSubmit={handleSubmit}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default App;
