import React, { useState, useEffect } from "react";
import {
  pipeline,
  AutoTokenizer,
  AutoModelForCausalLM,
  env,
  // getModelFile,
} from "@xenova/transformers";
import { useModel } from "../contexts/ModelContext";
import { getModelFile } from "@xenova/transformers/src/utils/hub";
import { InferenceSession, Tensor } from "onnxruntime-web/webgpu";

// Set environment variables for local model loading
// env.allowLocalModels = false;
// env.cacheDir = "/task-coach-browser/" + "dist/";
// env.useCache = true;

// const MODEL_NAME = "HuggingFaceTB/SmolLM-135M";
// const MODEL_NAME = "microsoft/Phi-3-mini-4k-instruct-onnx-web";

// const MODEL_NAME = "HuggingFaceTB/SmolLM-135M-Instruct";
const MODEL_NAME = "HuggingFaceTB/smollm-360M-instruct-add-basics";

function HuggingFaceComponent() {
  const { huggingFaceModel: modelPath, setHuggingFaceModel: setModelPath } =
    useModel();
  const [model, setModel] = useState(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const loadModel = async () => {
    env.allowLocalModels = false;
    setLoading(true);
    try {
      // const pipe = await pipeline("text-generation", modelPath, {
      //   // model_file_name: "model",
      //   // quantized: true,
      //   progress_callback: console.log,
      // });
      const buffer = await getModelFile(modelPath, "onnx/model.onnx", true, {});
      debugger;
      const session = await InferenceSession.create(buffer, {
        executionProviders: ["wasm"],
      });
      debugger;
      // const tokenizer = await AutoTokenizer.from_pretrained(modelPath);
      // debugger;
      // const outputTensors = await this.session.run(inputs, options);
      const model = await AutoModelForCausalLM.from_pretrained(modelPath, {
        progress_callback: console.log,
        model_file_name: "model",
        quantized: false,
      });
      debugger;
      setModel(model);
    } catch (error) {
      console.error("Error loading model:", error);
    }
    setLoading(false);
  };

  const generateText = async () => {
    if (!model || !input) return;
    try {
      const result = await model(input, {
        max_new_tokens: 50,
        temperature: 0.7,
      });
      setResult(result[0].generated_text);
    } catch (error) {
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
