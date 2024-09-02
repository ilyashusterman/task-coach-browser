import ModelContextSingleton from "./ModelContextSingleton";
import { generatePrompt, token_to_text } from "../utils/messages";

class WorkerInstance {
  constructor() {
    this.instance = ModelContextSingleton.getInstance();
    this.tokenizer = null;
    this.llm = null;
    this.config = null;
  }

  async initialize(progressCallback, modelLoadedCallback) {
    await this.instance.initialize(progressCallback, modelLoadedCallback);
    const { tokenizer, llm, config } = this.instance.getAll();
    this.tokenizer = tokenizer;
    this.llm = llm;
    this.config = config;
  }

  async terminateModel() {
    if (this.llm.abort) {
      this.llm.abort();
      await this.llm.initilize_feed();
      return true;
    }
    return false;
  }

  async chatCompletion(query, systemPrompt, stream, key) {
    if (!this.tokenizer || !this.llm) return null;

    const prompt = generatePrompt(query, systemPrompt);

    if (this.llm.pipeline) {
      return this.pipelineGeneration(prompt, key);
    } else {
      return this.tokenGeneration(prompt, stream, key);
    }
  }

  async pipelineGeneration(prompt, key) {
    const generator = await this.llm.pipeline;
    const output = await generator(prompt, {
      max_length: 9999,
      num_return_sequences: 1,
    });
    const outputText = output[0].generated_text;
    return { status: "final", text: outputText, key };
  }

  async tokenGeneration(prompt, stream, key) {
    const { input_ids } = await this.tokenizer(prompt, {
      return_tensor: false,
      padding: true,
      truncation: true,
    });

    await this.llm.initilize_feed();
    const start_timer = performance.now();
    const output_index = this.llm.output_tokens.length + input_ids.length;

    const output_tokens = await this.llm.generate(
      input_ids,
      (output_tokens) => {
        if (output_tokens.length === input_ids.length + 1) {
          const took = (performance.now() - start_timer) / 1000;
          console.log(
            `time to first token in ${took.toFixed(1)}sec, ${
              input_ids.length
            } tokens`
          );
        }

        const newText = token_to_text(
          this.tokenizer,
          output_tokens,
          output_index,
          this.config
        );

        if (stream) {
          return { status: "stream", text: newText, key };
        }
      },
      { max_tokens: this.config.max_tokens }
    );

    this.llm.abort();

    const finalText = token_to_text(
      this.tokenizer,
      output_tokens,
      output_index,
      this.config
    );

    return { status: "final", text: finalText, key };
  }
}

export default WorkerInstance;
