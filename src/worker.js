import ModelContextSingleton from "./contexts/ModelContextSingleton";
import { generatePrompt, token_to_text } from "./utils/messages";

const instance = ModelContextSingleton.getInstance();

self.addEventListener("message", async (event) => {
  const {
    query,
    systemPrompt,
    stream,
    event: eventData,
    key = undefined,
  } = event.data;

  await instance.initialize(
    (value) => self.postMessage({ status: "progress", value: value, key }),
    (value) => self.postMessage({ status: "isModelLoaded", value: value, key })
  );
  if (eventData === "initializingModel") {
    return;
  }
  const { tokenizer, llm, config } = instance.getAll();
  if (eventData === "terminateModel") {
    await llm.initilize_feed();
    self.postMessage({ status: "terminated", key: key });
    return;
    // remove from memory llm
  }

  if (!tokenizer || !llm) return;
  const prompt = generatePrompt(query, systemPrompt);

  const { input_ids } = await tokenizer(prompt, {
    return_tensor: false,
    padding: true,
    truncation: true,
  });
  console.log(`Tokens length = ${input_ids.length}`);
  await llm.initilize_feed();
  const start_timer = performance.now();
  const output_index = llm.output_tokens.length + input_ids.length;

  const output_tokens = await llm.generate(
    input_ids,
    (output_tokens) => {
      if (output_tokens.length == input_ids.length + 1) {
        // time to first token
        const took = (performance.now() - start_timer) / 1000;
        console.log(
          `time to first token in ${took.toFixed(1)}sec, ${
            input_ids.length
          } tokens`
        );
      }

      const newText = token_to_text(
        tokenizer,
        output_tokens,
        output_index,
        config
      );
      if (stream) {
        self.postMessage({ status: "stream", text: newText, key: key });
      }
    },
    { max_tokens: config.max_tokens }
  );

  const finalText = token_to_text(
    tokenizer,
    output_tokens,
    output_index,
    config
  );
  self.postMessage({ status: "final", text: finalText, key: key });
  return;
});
