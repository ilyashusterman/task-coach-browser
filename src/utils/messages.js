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

// Step 1: Define the Regular Expression
// Step 2: Write the Function
function findJsonInString(inputString) {
  // Use the regular expression to match the JSON object
  const match = inputString.match(/\{[^]*?\}/);

  // If a match is found, return the parsed JSON object
  if (match) {
    try {
      // Step 3: Parse the JSON
      const jsonObject = JSON.parse(match[0]);
      return jsonObject;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  } else {
    console.error("No JSON object found in the input string.");
    return null;
  }
}

export function extractJsonString(text) {
  const regex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(regex);

  try {
    if (match && match[1]) {
      const jsonString = match[1];
      const jsonObject = JSON.parse(jsonString);
      return jsonObject;
    } else {
      return JSON.parse(text);
    }
  } catch (e) {
    const parsedText = findJsonInString(text);
    if (parsedText) {
      return parsedText;
    }
  }
}
