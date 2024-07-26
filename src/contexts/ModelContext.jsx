import React, { createContext, useContext, useEffect, useState } from "react";
import ModelContextSingleton from "./ModelContextSingleton.js";
const ModelContext = createContext();

// const configBase = getConfig();
// env.localModelPath = "models";
// env.allowRemoteModels = configBase.local == 0;
// env.allowLocalModels = configBase.local == 1;

export const useModel = () => useContext(ModelContext);
const defaultTokenizer = () => null;

export const ModelProvider = ({ children }) => {
  const [llm, setLLM] = useState({});
  const [tokenizer, setTokenizer] = useState(defaultTokenizer);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState("starting progress");
  const [config, setConfig] = useState({});

  useEffect(() => {
    const initializeModel = async () => {
      const modelContextSingleton = ModelContextSingleton.getInstance(document);
      setLLM(modelContextSingleton.getLLM());
      setTokenizer(() => modelContextSingleton.getTokenizer());
      setIsModelLoaded(modelContextSingleton.getIsModelLoaded());
      setProgress(modelContextSingleton.getProgress());
      setConfig(modelContextSingleton.getConfig());
      await modelContextSingleton.initialize();
    };
    initializeModel();
  }, []);

  return (
    <ModelContext.Provider
      value={{
        llm,
        tokenizer,
        isModelLoaded,
        progress,
        config,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};
