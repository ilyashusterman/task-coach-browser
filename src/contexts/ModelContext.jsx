// src/contexts/ModelContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { env, AutoTokenizer } from "@xenova/transformers";
import { LLM } from "../utils/llm";
import { getConfig, hasWebGPU } from "../utils/utils";

const ModelContext = createContext();

export const useModel = () => useContext(ModelContext);
const defaultTokenizer = () => null;
export const ModelProvider = ({ children }) => {
  const [llm, setLLM] = useState({});
  const [tokenizer, setTokenizer] = useState(defaultTokenizer);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState("starting progress");

  useEffect(() => {
    const initializeModel = async () => {
      const config = getConfig();
      env.localModelPath = "models";
      env.allowRemoteModels = config.local == 0;
      env.allowLocalModels = config.local == 1;

      const newTokenizer = await AutoTokenizer.from_pretrained(
        config.model.path
      );
      setTokenizer(() => newTokenizer);

      const newLLM = new LLM();
      await newLLM.load(
        config.model,
        {
          provider: config.provider,
          profiler: config.profiler,
          verbose: config.verbose,
          local: config.local,
          max_tokens: config.max_tokens,
          hasFP16: (await hasWebGPU()) === 0,
        },
        setProgress
      );

      setLLM(newLLM);
      setIsModelLoaded(true);
    };

    initializeModel();
  }, []);

  return (
    <ModelContext.Provider value={{ llm, tokenizer, isModelLoaded, progress }}>
      {children}
    </ModelContext.Provider>
  );
};
