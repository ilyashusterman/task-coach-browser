import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { extractJsonString } from "../utils/messages";
import { chatCompletionAPI } from "../utils/llm-api";
import { chatCompletionReplicate } from "../utils/llm-replicate-api";
import WorkerInstance from "./WorkerInstance";

const ModelContext = createContext();

export const useModel = () => useContext(ModelContext);

const defaultSettings = {
  disallowedDownloading: true,
  apiUrlBaseLLM: "http://localhost:11434/api/chat",
  modelApi: "llama3.1",
  useAPI: false,
  useReplicateAPI: false,
  replicateModelPath: "meta/meta-llama-3.1-405b-instruct",
  huggingFaceModel: "HuggingFaceTB/SmolLM-360M-Instruct",
};

const getUserSettings = () => {
  const storedSettings = localStorage.getItem("userModelSettings");
  if (
    !storedSettings ||
    storedSettings === undefined ||
    storedSettings === null
  ) {
    return defaultSettings;
  }
  return storedSettings
    ? { ...defaultSettings, ...JSON.parse(storedSettings) }
    : defaultSettings;
};
export const USER_SETTINGS = getUserSettings();

const saveUserSettings = (newSettings) => {
  const updatedSettings = {
    ...getUserSettings(),
    ...newSettings,
    modified: new Date().toISOString(),
  };
  localStorage.setItem("userModelSettings", JSON.stringify(updatedSettings));
  return updatedSettings;
};

export const ModelProvider = ({ children }) => {
  const [workerInstance, setWorkerInstance] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState({
    text: "Starting progress",
    progress: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState(getUserSettings());
  const chatQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  const initializationAttempted = useRef(false);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      saveUserSettings(newSettings);
      return newSettings;
    });
  }, []);

  const initializeWorker = useCallback(async () => {
    if (initializationAttempted.current) {
      return;
    }

    if (
      settings.useAPI ||
      settings.disallowedDownloading ||
      settings.useReplicateAPI
    ) {
      return;
    }
    initializationAttempted.current = true;
    try {
      const instance = new WorkerInstance();
      await instance.initialize(
        (value) => setProgress(value),
        (value) => setIsModelLoaded(value)
      );
      setWorkerInstance(instance);
    } catch (error) {
      console.error("Failed to initialize worker:", error);
    } finally {
      initializationAttempted.current = false;
    }
  }, [
    settings.useAPI,
    settings.disallowedDownloading,
    settings.useReplicateAPI,
  ]);

  useEffect(() => {
    initializeWorker();
  }, [settings.disallowedDownloading]);

  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current) {
      return;
    }

    isProcessingQueue.current = true;
    setIsGenerating(true);

    while (chatQueue.current.length > 0) {
      const {
        query,
        prompt,
        resolve,
        reject,
        callBackUpdate,
        timeoutMiliseconds,
      } = chatQueue.current[0];

      try {
        let result;
        if (settings.useReplicateAPI) {
          result = await chatCompletionReplicate(
            query,
            prompt,
            settings.replicateApiToken,
            settings.replicateModelPath,
            callBackUpdate
          );
        } else if (settings.useAPI) {
          result = await chatCompletionAPI(
            {
              query,
              prompt,
              baseUrl: settings.apiUrlBaseLLM,
              model: settings.modelApi,
            },
            callBackUpdate,
            timeoutMiliseconds
          );
        } else if (isModelLoaded && workerInstance) {
          const response = await workerInstance.chatCompletion(
            query,
            prompt,
            true,
            uuidv4()
          );
          result = response.text;
        } else {
          throw new Error("No model loaded");
        }

        if (callBackUpdate) callBackUpdate(result);
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        chatQueue.current.shift();
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    setIsGenerating(false);
    isProcessingQueue.current = false;
  }, [settings, isModelLoaded, workerInstance]);

  const chatCompletion = useCallback(
    async (
      query,
      prompt,
      callBackUpdate = undefined,
      timeoutMiliseconds = 150000
    ) => {
      return new Promise((resolve, reject) => {
        chatQueue.current.push({
          query,
          prompt,
          resolve,
          reject,
          callBackUpdate,
          timeoutMiliseconds,
        });
        processQueue();
      });
    },
    [processQueue]
  );

  const chatCompletionJSON = useCallback(
    async (
      query,
      sysPrompt,
      retries = 3,
      callBackUpdate = undefined,
      timeoutMiliseconds = 150000
    ) => {
      let response = "";
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          response = await chatCompletion(
            query,
            sysPrompt,
            callBackUpdate,
            timeoutMiliseconds
          );
          break;
        } catch (error) {
          console.error(`Attempt ${attempt + 1} failed:`, error);
          if (attempt === retries - 1) throw error;
        }
      }
      const objects = extractJsonString(response);
      if (objects === null || objects === undefined || objects.length === 0) {
        throw new Error("Error: " + response);
      }
      return objects;
    },
    [chatCompletion]
  );

  const abortWorker = useCallback(async () => {
    console.log("Aborting");
  });

  const contextValue = {
    isModelLoaded,
    progress,
    chatCompletionJSON,
    chatCompletion,
    abortWorker,
    isGenerating,
    canUseChatCompletion:
      settings.useAPI || settings.useReplicateAPI || isModelLoaded,
    ...settings,
    setDisallowedDownloading: (value) =>
      updateSetting("disallowedDownloading", value),
    setApiUrlBaseLLM: (value) => updateSetting("apiUrlBaseLLM", value),
    setDisplayModelSettings: (value) =>
      updateSetting("displayModelSettings", value),
    setApiModel: (value) => updateSetting("modelApi", value),
    setUseAPI: (value) => updateSetting("useAPI", value),
    setUseReplicateAPI: (value) => updateSetting("useReplicateAPI", value),
    setReplicateApiToken: (value) => updateSetting("replicateApiToken", value),
    setReplicateModelPath: (value) =>
      updateSetting("replicateModelPath", value),
    setHuggingFaceModel: (value) => updateSetting("huggingFaceModel", value),
  };

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};

export default ModelProvider;
