export const generatePrompt = (query, systemPrompt) =>
  // const messagesSend = [
  //     { role: "assistant", content: systemPrompt },
  //     { role: "user", content: query },
  //   ];
  //   const prompt = tokenizer
  //     .apply_chat_template(messagesSend, {
  //       tokenize: false,
  //       add_generation_prompt: true,
  //     })
  //     .replace("<s>", "<|system|>\n");
  `<|system|>\n${systemPrompt}<|end|>\n<|user|>\n${query}<|end|>\n<|assistant|>\n`;

//   const chatCompletion = async (query) => {
//     if (!tokenizer || !llm) return;
//     setIsGenerating(true);

//     const prompt = generatePrompt(query, systemPrompt);

//     const { input_ids } = await tokenizer(prompt, {
//       return_tensor: false,
//       padding: true,
//       truncation: true,
//     });
//     llm.initilize_feed();

//     const start_timer = performance.now();
//     const output_index = llm.output_tokens.length + input_ids.length;

//     const output_tokens = await llm.generate(
//       input_ids,
//       (output_tokens) => {
//         const newText = token_to_text(tokenizer, output_tokens, output_index);
//         console.log(newText)
//         setChatHistory((prev) => [
//           ...prev.slice(0, -1),
//           { ...prev[prev.length - 1], role: "assistant", content: newText },
//         ]);
//       },
//       { max_tokens: config.max_tokens }
//     );

//     const took = (performance.now() - start_timer) / 1000;
//     console.log(
//       `time to first token in ${took.toFixed(1)}sec, ${input_ids.length} tokens`
//     );
//     const finalText = token_to_text(tokenizer, output_tokens, output_index);
//     setChatHistory((prev) => [
//       ...prev.slice(0, -1),
//       { role: "assistant", content: finalText },
//     ]);
//     setIsGenerating(false);
//   };

export const token_to_text = (tokenizer, tokens, startidx, config) => {
  return tokenizer.decode(tokens.slice(startidx), {
    skip_special_tokens: config.show_special != 1,
  });
};
