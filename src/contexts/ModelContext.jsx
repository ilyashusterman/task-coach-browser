import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import ModelContextSingleton from "./ModelContextSingleton.js";

const ModelContext = createContext();

export const useModel = () => useContext(ModelContext);

const defaultTokenizer = () => null;

export const ModelProvider = ({ children }) => {
  const [llm, setLLM] = useState({});
  const [tokenizer, setTokenizer] = useState(defaultTokenizer);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState("Starting progress");
  const [config, setConfig] = useState({});

  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeModel = async () => {
      if (hasInitialized.current) {
        return;
      }
      hasInitialized.current = true; // Set the ref to true to prevent re-initialization
      const modelContextSingleton = ModelContextSingleton.getInstance(
        document,
        {
          setProgress,
          setIsModelLoaded,
          setConfig,
        }
      );
      await modelContextSingleton.initialize();
      setLLM(modelContextSingleton.getLLM());
      setTokenizer(() => modelContextSingleton.getTokenizer());
    };
    initializeModel();
  }, []); // Empty dependency array ensures this runs only once

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
