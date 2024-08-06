import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { extractJsonString } from "../utils/messages";
import { chatCompletionAPI } from "../utils/llm-api";
const ModelContext = createContext();

export const useModel = () => useContext(ModelContext);

export const getUserSettings = () => {
  let userModelSettingsLocalStorage;
  let userModelSettingsLocalStorageRaw =
    localStorage.getItem("userModelSettings");

  if (!userModelSettingsLocalStorageRaw) {
    userModelSettingsLocalStorage = {
      disallowedDownloading: true,
      apiUrlBaseLLM: "http://localhost:11434/api/chat",
      modelApi: "llama3.1",
      useAPI: false,
    };
  } else {
    userModelSettingsLocalStorage = JSON.parse(
      userModelSettingsLocalStorageRaw
    );
  }
  return userModelSettingsLocalStorage;
};
export const USER_SETTINGS = getUserSettings();

export const ModelProvider = ({ children }) => {
  const worker = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState({
    text: "Starting progress",
    progress: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [disallowedDownloading, setDisallowedDownloading] = useState(
    USER_SETTINGS.disallowedDownloading
  );
  const [apiUrlBaseLLM, setApiUrlBaseLLM] = useState(
    USER_SETTINGS.apiUrlBaseLLM
  );
  const [modelApi, setApiModel] = useState(USER_SETTINGS.modelApi);
  const [useAPI, setUseAPI] = useState(USER_SETTINGS.useAPI);
  const [displayModelSettings, setDisplayModelSettings] = useState(false);
  const chatCompletionJSON = async (
    query,
    sysPrompt,
    retries = 3,
    callBackUpdate = undefined,
    timeoutMiliseconds = 150000
  ) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await chatCompletion(
          query,
          sysPrompt,
          callBackUpdate,
          timeoutMiliseconds
        );
        return extractJsonString(response);
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt >= retries) {
          throw new Error(`Failed after ${retries} attempts`);
        }
      }
    }
  };

  const chatCompletion = async (
    query,
    prompt,
    callBackUpdate = undefined,
    timeoutMiliseconds = 150000
  ) => {
    if (useAPI) {
      return await chatCompletionAPI(
        { query, prompt, baseUrl: apiUrlBaseLLM, model: modelApi },
        callBackUpdate,
        timeoutMiliseconds
      );
    }

    if (!isModelLoaded) {
      return "No model loaded";
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
            new Promise((resolveWaitGenerating) => {
              const result = setIsGenerating(false);
              resolveWaitGenerating(result);
            }).then(() => {
              new Promise((resolveWait) => setTimeout(resolveWait, 2000)).then(
                () => {
                  resolve(text);
                }
              );
            });
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
    return await initWorker(isInitial);
  };
  const initWorker = async (isInitial = true) => {
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
      console.log("initializingModel ", uuidKey);
      // wait for 1 seconds the worker to finish initializing the model.
      await new Promise((resolve, reject) => {
        worker.current.onmessage = (event) => {
          if (event.data.key === undefined && event.data?.key !== uuidKey) {
            return;
          }
          console.log("Got initializingModel ", event.data?.key);
          const { status, value } = event.data;
          if (status === "progress") {
            if (isInitial) {
              setProgress(value);
              resolve(true);
            }
          }
          if (status === "isModelLoaded") {
            setIsModelLoaded(value);
            resolve(true);
          }
        };
      });
    }
  };
  const abortWorker = () => restartWorker;
  useEffect(() => {
    if (useAPI && disallowedDownloading) {
      return;
    }
    restartWorker(true);
  }, [disallowedDownloading]); // Empty dependency array ensures this runs only once

  return (
    <ModelContext.Provider
      value={{
        worker,
        isModelLoaded,
        progress,
        chatCompletionJSON,
        chatCompletion,
        abortWorker,
        disallowedDownloading,
        setDisallowedDownloading,
        apiUrlBaseLLM,
        setApiUrlBaseLLM,
        displayModelSettings,
        setDisplayModelSettings,
        modelApi,
        setApiModel,
        useAPI,
        setUseAPI,
        isGenerating,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};
