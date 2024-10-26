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

function extractJsonObjects(inputString) {
  // Step 1: Define a regular expression to capture JSON arrays or objects without recursion
  const jsonRegex = /(\[.*?\]|\{.*?\})/gs;

  // Step 2: Find matches for JSON patterns (arrays or objects)
  const matches = inputString.match(jsonRegex);

  if (!matches) {
    // No JSON patterns found, return an empty array
    return [];
  }

  // Step 3: Parse each matched JSON string
  const jsonObjects = matches.map((match) => {
    try {
      return JSON.parse(match);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  });
  if (jsonObjects.length === 1) {
    return jsonObjects[0];
  }
  // Filter out any null results from failed parses
  return jsonObjects.filter((obj) => obj !== null);
}

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
  try {
    return extractJsonObjects(text);
  } catch (e) {
    const parsedText = findJsonInString(text);
    if (parsedText) {
      return parsedText;
    } else {
      throw new Error("Error: " + text);
    }
  }
  throw new Error("Error: " + text);
}

export function generateToolCall(name, description, schema) {
  // Step 1: Replace "object" with "dict" in the schema
  const updatedSchema = JSON.stringify(schema, null, 4).replace(
    /"type": "object"/g,
    '"type": "dict"'
  );

  // Step 2: Format the function description
  const functionDescription = `
[
    {
        "name": "${name}",
        "description": "${description}",
        "parameters": ${updatedSchema}
    }
]`;

  // Step 3: Create the complete output
  const content = `
Questions: Can you retrieve the details?
Here is a list of functions in JSON format that you can invoke:
${functionDescription}
Should you decide to return the function call(s),Put it in the format of [func1(params_name=params_value, params_name2=params_value2...)]
NO other text MUST be included.
  `.trim();

  return content;
}

export function extractToolChoice(jsonString) {
  // Define markers for extraction
  const startMarker = "#####TOOL_CHOICE_START######";
  const endMarker = "#####TOOL_CHOICE_END######";

  // Find the start and end indices of the JSON section
  const startIndex = jsonString.indexOf(startMarker) + startMarker.length;
  const endIndex = jsonString.indexOf(endMarker);

  // Check if markers are found; if not, return null for jsonObject and the entire string as prompt
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return {
      tool: null,
      prompt: jsonString.trim(),
    };
  }

  // Extract substring between the markers
  const jsonSubstring = jsonString.slice(startIndex, endIndex).trim();
  // Try to parse the extracted substring as JSON
  try {
    const tool = JSON.parse(jsonSubstring);
    return {
      tool, // Parsed JSON object
      prompt: jsonString.slice(0, startIndex).replace(startMarker, ""), // Original string without markers and JSON object
    };
  } catch (error) {
    // If JSON parsing fails, return null and the full original string as prompt
    return {
      tool: null,
      prompt: jsonString.trim(),
    };
  }
}
