import React, { useState, useEffect } from "react";
// import {
//   pipeline,
//   AutoTokenizer,
//   AutoModelForCausalLM,
//   env,
//   // getModelFile,
// } from "@xenova/transformers";
import { pipeline } from "@huggingface/transformers";
import { useModel } from "../contexts/ModelContext";
// import { getModelFile } from "@xenova/transformers/src/utils/hub";
// import { InferenceSession, Tensor } from "onnxruntime-web/webgpu";

// Set environment variables for local model loading
// env.allowLocalModels = false;
// env.cacheDir = "/task-coach-browser/" + "dist/";
// env.useCache = true;

// const MODEL_NAME = "HuggingFaceTB/SmolLM-135M";
// const MODEL_NAME = "microsoft/Phi-3-mini-4k-instruct-onnx-web";

// const MODEL_NAME = "HuggingFaceTB/SmolLM-135M-Instruct";
const MODEL_NAME = "onnx-community/Llama-3.2-1B-Instruct-q4f16";

export const loadModelInstance = (function () {
  let model = null; // Closure to store the model instance

  return async function (
    modelPath = MODEL_NAME,
    progress_callback = console.log
  ) {
    if (!model) {
      console.log("Loading model...", modelPath);
      model = await pipeline("text-generation", modelPath, {
        device: "webgpu", // <- Run on WebGPU
        progress_callback: progress_callback,
      });
    } else {
      console.log("Using cached model...");
    }
    return model;
  };
})();

function HuggingFaceComponent() {
  const { huggingFaceModel: modelPath, setHuggingFaceModel: setModelPath } =
    useModel();
  const [model, setModel] = useState(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const loadModel = async () => {
    // env.allowLocalModels = false;
    setLoading(true);
    try {
      console.log("modelPath", modelPath);
      const generator = await loadModelInstance();
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is the capital of France?" },
      ];
      const output = await generator(messages, { max_new_tokens: 1000 });
      // setResult(result[0].generated_text);
      setResult(output[0].generated_text.at(-1).content);
    } catch (error) {
      console.error("Error loading model:", error);
    }
    setLoading(false);
  };

  const generateText = async () => {
    if (!input) return;
    try {
      // const generator = await pipeline("text-generation", modelPath, {
      //   device: "webgpu", // <- Run on WebGPU
      //   progress_callback: console.log,
      // });
      const generator = await loadModelInstance(modelPath, console.log);
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: input },
      ];
      const output = await generator(messages, { max_new_tokens: 1200 });
      // setResult(result[0].generated_text);
      setResult(output[0].generated_text.at(-1).content);
    } catch (error) {
      debugger;
      console.error("Error generating text:", error);
      setResult("Error generating text. Please try again.");
    }
  };

  return (
    <div>
      <input
        value={modelPath}
        onChange={(e) => setModelPath(e.target.value)}
        className="text-3xl font-bold mb-4 text-green-800 w-full mr-2 bg-transparent border-b border-transparent focus:border-green-300 focus:outline-none transition-all duration-300"
      />
      <h1>Text Generation (Local Model)</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text prompt"
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={generateText} disabled={loading || !model}>
        Generate Text
      </button>
      <button onClick={loadModel} disabled={loading}>
        Load model
      </button>
      {loading && <p>Loading model...</p>}
      {result && (
        <div>
          <h2>Generated Text:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default HuggingFaceComponent;
