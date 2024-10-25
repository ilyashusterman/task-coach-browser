import { pipeline } from "@huggingface/transformers";
import { generateToolCall } from "../utils/messages";

const MODEL_NAME = "onnx-community/Llama-3.2-1B-Instruct-q4f16";

export const loadModelInstance = (function () {
  let model = null; // Closure to store the model instance

  return async function (
    progress_callback = console.log,
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
    await loadModelInstance(({ progress, status }) => {
      console.log("progress", progress);
      console.log("status", status);
      progressCallback(progress);
      modelLoadedCallback(status === "ready");
    });
  }

  async terminateModel() {
    console.log("delete me ");
  }

  async chatCompletion(
    query,
    systemPrompt,
    stream = false,
    key = null,
    tools = true
  ) {
    const generator = await loadModelInstance();
    generator;
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        // content: `give me json string response of the input : "${query}"`,
        content: query,
      },
    ];
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
    await generator.dispose();
    return {
      status: "final",
      text: output[0].generated_text.at(-1).content,
      key,
    };
  }
}

export default WorkerInstance;
