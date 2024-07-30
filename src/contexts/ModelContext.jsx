import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { extractJsonString } from "../utils/messages";
const ModelContext = createContext();

export const useModel = () => useContext(ModelContext);

export const ModelProvider = ({ children }) => {
  const worker = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState({
    text: "Starting progress",
    progress: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const chatCompletionJSON = async (query, sysPrompt) => {
    const response = await chatCompletion(query, sysPrompt);
    return extractJsonString(response);
  };

  const chatCompletion = async (
    query,
    prompt,
    callBackUpdate = undefined,
    timeoutMiliseconds = 150000
  ) => {
    while (isGenerating) {
      //wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsGenerating(true);
    const uuidKey = uuidv4();
    worker.current.postMessage({
      query,
      systemPrompt: prompt,
      stream: true,
      event: "chatCompletion",
      key: uuidKey,
    });

    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `No message received within ${timeoutMiliseconds / 1000} seconds`
          )
        );
      }, timeoutMiliseconds);

      worker.current.onmessage = (event) => {
        if (event.data.key === undefined && event.data?.key !== uuidKey) {
          return;
        }
        clearTimeout(timeout);
        const { status, text } = event.data;
        if (status === "final") {
          if (callBackUpdate !== undefined) {
            callBackUpdate(text);
          }
          restartWorker(false).then(() => {
            setIsGenerating(false);
            resolve(text);
          });
        }
        if (status === "stream") {
          if (callBackUpdate !== undefined) {
            callBackUpdate(text);
          }
        }
      };
    });
  };
  const restartWorker = async (isInitial = true) => {
    if (worker.current) {
      await new Promise((resolve, reject) => {
        const uuidKey = uuidv4();
        worker.current.postMessage({
          event: "terminateModel",
          key: uuidKey,
        });
        const timeout = setTimeout(() => {
          reject(
            new Error(
              `terminateWorker: No message received within ${5000} seconds`
            )
          );
        }, 5000);

        worker.current.onmessage = (event) => {
          if (event.data.key !== uuidKey) {
            return;
          }
          clearTimeout(timeout);
          const { status, value } = event.data;
          if (status === "terminated") {
            resolve(value);
          }
        };
      });

      await worker.current.terminate();
      worker.current = null;
    }
    initWorker(isInitial);
  };
  const initWorker = (isInitial = true) => {
    if (!worker.current) {
      const uuidKey = uuidv4();
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL("../worker.js", import.meta.url), {
        type: "module",
        name: "ChatCompletion",
      });
      worker.current.postMessage({
        event: "initializingModel",
        key: uuidKey,
      });
      worker.current.onmessage = (event) => {
        if (event.data.key === undefined && event.data?.key !== uuidKey) {
          return;
        }
        const { status, value } = event.data;
        if (status === "progress") {
          if (isInitial) {
            setProgress(value);
          }
        }
        if (status === "isModelLoaded") {
          setIsModelLoaded(value);
        }
      };
    }
  };

  useEffect(() => {
    restartWorker(true);
  }, []); // Empty dependency array ensures this runs only once

  return (
    <ModelContext.Provider
      value={{
        worker,
        isModelLoaded,
        progress,
        chatCompletionJSON,
        chatCompletion,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};
