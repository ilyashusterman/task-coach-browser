import React, { useEffect, useState } from "react";
import { useModel, USER_SETTINGS } from "../contexts/ModelContext";
import "./ModelSettingsEditor.css";

const ModelSettingsEditor = () => {
  const {
    disallowedDownloading,
    apiUrlBaseLLM,
    setApiUrlBaseLLM,
    setDisallowedDownloading,
    isModelLoaded,
    progress,
    displayModelSettings,
    modelApi,
    setApiModel,
    useAPI,
    setUseAPI,
  } = useModel();
  const [userModelSettings, setUserModelSettingsBase] = useState(USER_SETTINGS);

  const setUserModelSettings = ({ ...props }) => {
    if (props.useAPI) {
      props.disallowedDownloading = false;
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
    if (!userModelSettingsLocalStorage.disallowedDownloading) {
      setDisallowedDownloading(false);
    }

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
  };

  if (!displayModelSettings) return null;

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
              <span>{progress.text}</span>
              <span className="text-blue-600">
                {Math.round(progress.progress)}%
              </span>
            </div>
            <div className="mt-1 h-2 bg-blue-200 rounded-full">
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
            htmlFor="use-api"
            className="text-sm font-medium text-gray-700"
          >
            Use API
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
