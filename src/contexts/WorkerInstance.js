import { pipeline } from "@huggingface/transformers";

import { extractToolChoice } from "../utils/messages";

const MODEL_NAME = "onnx-community/Llama-3.2-1B-Instruct-q4f16";
const statuesOutput = ["download", "ready"];
const logProgressDefault = (props) => {
  // if props.progress in statuesOutput console.log it
  if (statuesOutput.includes(props.progress)) {
    console.log(props);
  }
};

export const loadModelInstance = (function () {
  let model = null; // Closure to store the model instance

  return async function (
    progress_callback = logProgressDefault,
    modelPath = MODEL_NAME
  ) {
    return await pipeline("text-generation", modelPath, {
      device: "webgpu", // <- Run on WebGPU
      progress_callback: progress_callback,
    });
    // if (!model) {
    //   console.log("Loading model...", modelPath);
    //   model = await pipeline("text-generation", modelPath, {
    //     device: "webgpu", // <- Run on WebGPU
    //     progress_callback: progress_callback,
    //   });
    // } else {
    //   console.log("Using cached model...");
    //   progress_callback({ progress: 100, status: "done" });
    // }
    // return model;
  };
})();

class WorkerInstance {
  constructor() {
    this.progressCallback = null;
    this.modelLoadedCallback = null;
  }
  async initialize(progressCallback, modelLoadedCallback) {
    this.progressCallback = progressCallback;
    this.modelLoadedCallback = modelLoadedCallback;
    await loadModelInstance(({ progress, status, ...props }) => {
      console.log("progress", progress);
      console.log("status", status);
      progressCallback({ progress, text: status, ...props });
      modelLoadedCallback(status === "ready");
    });
  }

  async terminateModel() {
    console.log("delete me ");
  }

  async chatCompletion(query, systemPrompt, stream = false, key = null) {
    const generator = await loadModelInstance();
    generator;
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: query,
      },
    ];
    const generatorArgs = {
      temperature: 0,
      max_new_tokens: 1024,
      do_sample: false,
    };
    const { tool, prompt: systemPromptTool } = extractToolChoice(systemPrompt);
    if (tool !== null) {
      generatorArgs.functions = [tool];
      generatorArgs.function_call = "auto";
      messages[0].content = systemPromptTool;
      messages.push({
        role: "assistant",
        content: JSON.stringify(generatorArgs.functions),
        tools: generatorArgs.functions,
      });
    }
    const output = await generator(messages, {
      temperature: 0,
      max_new_tokens: 1024,
      do_sample: false,
      // return_dict_in_generate: true,
      // top_p: 0.8,
      // repetition_penalty: 1.1,
      // no_repeat_ngram_size: 2,
      // do_sample: false,
    });
    console.log("output raw", output);
    console.log("output", output[0].generated_text.at(-1).content);
    await generator.dispose();
    return {
      status: "final",
      text: output[0].generated_text.at(-1).content,
      key,
    };
  }
}

export default WorkerInstance;
