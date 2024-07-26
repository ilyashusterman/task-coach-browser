import ModelContextSingleton from "./contexts/ModelContextSingleton";
import { generatePrompt, token_to_text } from "./utils/messages";

const instance = ModelContextSingleton.getInstance();

self.addEventListener("message", async (event) => {
  const { query, systemPrompt, stream } = event.data;
  await instance.initialize();

  const { tokenizer, llm, config } = instance.getAll();

  if (!tokenizer || !llm) return;
  const prompt = generatePrompt(query, systemPrompt);

  const { input_ids } = await tokenizer(prompt, {
    return_tensor: false,
    padding: true,
    truncation: true,
  });
  llm.initilize_feed();

  const start_timer = performance.now();
  const output_index = llm.output_tokens.length + input_ids.length;

  const output_tokens = await llm.generate(
    input_ids,
    (output_tokens) => {
      const newText = token_to_text(
        tokenizer,
        output_tokens,
        output_index,
        config
      );
      if (stream) {
        self.postMessage({ status: "stream", text: newText });
      }
    },
    { max_tokens: config.max_tokens }
  );

  const took = (performance.now() - start_timer) / 1000;
  console.log(
    `time to first token in ${took.toFixed(1)}sec, ${input_ids.length} tokens`
  );
  const finalText = token_to_text(
    tokenizer,
    output_tokens,
    output_index,
    config
  );
  self.postMessage({ status: "final", text: finalText });
});
