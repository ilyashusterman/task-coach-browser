import React, { useEffect, useState } from "react";
import { useModel, USER_SETTINGS } from "../contexts/ModelContext";
import "./ModelSettingsEditor.css";
import CorsDemoNotice from "./CorsDemoNotice";

const ModelSettingsEditor = () => {
  const {
    disallowedDownloading,
    apiUrlBaseLLM,
    setApiUrlBaseLLM,
    setDisallowedDownloading,
    isModelLoaded,
    progress,
    modelApi,
    setApiModel,
    useAPI,
    setUseAPI,
    useReplicateAPI,
    setUseReplicateAPI,
    replicateApiToken,
    setReplicateApiToken,
    replicateModelPath,
    setReplicateModelPath,
  } = useModel();
  const [userModelSettings, setUserModelSettingsBase] = useState(USER_SETTINGS);

  const setUserModelSettings = ({ ...props }) => {
    if (props.useAPI || props.useReplicateAPI) {
      props.disallowedDownloading = true;
    }
    const newSettings = saveSettingsLocalStorage(props);
    setSettingsContextProvider(newSettings);
  };

  const saveSettingsLocalStorage = ({ ...props }) => {
    const newSettings = {
      modified: new Date().toISOString(),
      ...userModelSettings,
      ...props,
    };
    setUserModelSettingsBase(newSettings);
    localStorage.setItem("userModelSettings", JSON.stringify(newSettings));
    return newSettings;
  };

  useEffect(() => {
    setUserModelSettings(USER_SETTINGS);
  }, []);

  const setSettingsContextProvider = (userModelSettingsLocalStorage) => {
    setDisallowedDownloading(
      userModelSettingsLocalStorage.disallowedDownloading
    );
    if (
      userModelSettingsLocalStorage.apiUrlBaseLLM &&
      userModelSettingsLocalStorage.apiUrlBaseLLM !== ""
    ) {
      setApiUrlBaseLLM(userModelSettingsLocalStorage.apiUrlBaseLLM);
    }
    if (
      userModelSettingsLocalStorage.apiModel &&
      userModelSettingsLocalStorage.apiModel !== ""
    ) {
      setApiModel(userModelSettingsLocalStorage.apiModel);
    }
    if (userModelSettingsLocalStorage.useAPI) {
      setUseAPI(userModelSettingsLocalStorage.useAPI);
    }
    if (userModelSettingsLocalStorage.useReplicateAPI !== undefined) {
      setUseReplicateAPI(userModelSettingsLocalStorage.useReplicateAPI);
    }
    if (userModelSettingsLocalStorage.replicateApiToken) {
      setReplicateApiToken(userModelSettingsLocalStorage.replicateApiToken);
    }
    if (userModelSettingsLocalStorage.replicateModelPath) {
      setReplicateModelPath(userModelSettingsLocalStorage.replicateModelPath);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          Model Settings
        </h2>
      </div>
      <div className="p-4 space-y-4">
        {!isModelLoaded && !disallowedDownloading && (
          <div className="text-sm text-gray-600">Loading model...</div>
        )}

        {!disallowedDownloading && progress?.text && progress?.progress && (
          <div className="bg-blue-100 p-3 rounded-md">
            <div className="text-sm font-medium text-blue-800 flex justify-between items-center">
              <div className="space-y-1">
                <span>{progress.text}</span>
                {progress.name && (
                  <div className="text-xs text-blue-700">
                    Model: {progress.name}
                  </div>
                )}
                {progress.file && (
                  <div className="text-xs text-blue-700">
                    File: {progress.file}
                  </div>
                )}
              </div>
              <span className="text-blue-600 ml-4">
                {Math.round(progress.progress)}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-blue-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label
            htmlFor="allow-download"
            className="text-sm font-medium text-gray-700"
          >
            Allow Downloading
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              name="allow-download"
              id="allow-download"
              checked={!disallowedDownloading}
              onChange={(e) =>
                setUserModelSettings({
                  disallowedDownloading: !e.target.checked,
                })
              }
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="allow-download"
              className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
            ></label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="use-replicate-api"
            className="text-sm font-medium text-gray-700"
          >
            Use Replicate API
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              name="use-replicate-api"
              id="use-replicate-api"
              checked={useReplicateAPI}
              onChange={(e) => {
                setUserModelSettings({
                  useReplicateAPI: e.target.checked,
                });
                setUseReplicateAPI(e.target.checked);
              }}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="use-replicate-api"
              className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
            ></label>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="replicate-api-token"
            className="text-sm font-medium text-gray-700 block"
          >
            Replicate API Token
          </label>
          <input
            id="replicate-api-token"
            type="password"
            value={replicateApiToken}
            onChange={(e) =>
              setUserModelSettings({ replicateApiToken: e.target.value })
            }
            placeholder="Enter Replicate API token"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="replicate-model-path"
            className="text-sm font-medium text-gray-700 block"
          >
            Replicate Model Path
          </label>
          <input
            id="replicate-model-path"
            type="text"
            value={replicateModelPath}
            onChange={(e) =>
              setUserModelSettings({ replicateModelPath: e.target.value })
            }
            placeholder="Enter Replicate model path"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <p className="text-base text-gray-500">
          You need a{" "}
          <a
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://replicate.com/account/api-tokens?utm_campaign=llama2ai&amp;utm_source=project"
          >
            Replicate API token
          </a>{" "}
          to run this demo. Copy it and paste above.
        </p>
        <CorsDemoNotice />
        <div className="flex items-center justify-between">
          <label
            htmlFor="use-api"
            className="text-sm font-medium text-gray-700"
          >
            Use local API
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              name="use-api"
              id="use-api"
              checked={useAPI}
              onChange={(e) => {
                setUserModelSettings({
                  useAPI: e.target.checked,
                });
                setUseAPI(e.target.checked);
              }}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="use-api"
              className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
            ></label>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="api-url"
            className="text-sm font-medium text-gray-700 block"
          >
            BASE API URL
          </label>
          <input
            id="api-url"
            type="text"
            value={apiUrlBaseLLM}
            onChange={(e) =>
              setUserModelSettings({ apiUrlBaseLLM: e.target.value })
            }
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500">
            For running ollama locally, use http://localhost:11434/api/chat
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="model-api"
            className="text-sm font-medium text-gray-700 block"
          >
            Model
          </label>
          <input
            id="model-api"
            type="text"
            value={modelApi}
            onChange={(e) => setUserModelSettings({ modelApi: e.target.value })}
            placeholder="Enter model name"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ModelSettingsEditor;
