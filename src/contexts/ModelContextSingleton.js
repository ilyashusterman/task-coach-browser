// src/utils/ModelContextSingleton.js
import { env, AutoTokenizer } from "@xenova/transformers";
import { LLM } from "../utils/llm";
import { getConfig, hasWebGPU } from "../utils/utils";

class ModelContextSingleton {
  static instance = null;

  constructor(document = undefined) {
    if (ModelContextSingleton.instance) {
      return ModelContextSingleton.instance;
    }
    // Setting environment variables and configuration
    const config = getConfig();
    env.localModelPath = "models";
    env.allowRemoteModels = config.local == 0;
    env.allowLocalModels = config.local == 1;
    if (document) {
      this.document = document;
    }
    this.config = config;

    // Initializing properties
    this.llm = {};
    this.tokenizer = null;
    this.isModelLoaded = false;
    this.progress = "starting progress";

    // Assign the instance
    ModelContextSingleton.instance = this;
  }

  // Method to initialize the singleton instance
  static getInstance(document = undefined) {
    if (!ModelContextSingleton.instance) {
      ModelContextSingleton.instance = new ModelContextSingleton(document);
    }
    return ModelContextSingleton.instance;
  }

  // Asynchronous method to initialize the model
  async initialize() {
    if (this.isModelLoaded) {
      return;
    }

    this.tokenizer = await AutoTokenizer.from_pretrained(
      this.config.model.path
    );

    this.llm = new LLM(this.document);
    await this.llm.load(
      this.config.model,
      {
        provider: this.config.provider,
        profiler: this.config.profiler,
        verbose: this.config.verbose,
        local: this.config.local,
        maxTokens: this.config.maxTokens,
        hasFP16: (await hasWebGPU()) === 0,
      },
      (progress) => {
        this.progress = progress;
      }
    );

    this.isModelLoaded = true;
  }

  // Getter methods to access properties
  getLLM() {
    return this.llm;
  }

  getTokenizer() {
    return this.tokenizer;
  }

  getConfig() {
    return this.config;
  }

  getIsModelLoaded() {
    return this.isModelLoaded;
  }

  getProgress() {
    return this.progress;
  }

  getAll() {
    return {
      tokenizer: this.tokenizer,
      config: this.config,
      isModelLoaded: this.isModelLoaded,
      progress: this.progress,
      llm: this.llm,
    };
  }
}

// Export the singleton instance
export default ModelContextSingleton;
