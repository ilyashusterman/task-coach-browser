import axios from "axios";

export async function chatCompletionAPI(
  { query, prompt, baseUrl: url, model },
  callBackUpdate,
  timeoutMiliseconds
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMiliseconds);

  try {
    const response = await axios({
      method: "post",
      url,
      data: {
        model: model,
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: query,
          },
        ],
        stream: false,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Call the callback with the complete response
    const fullResponse = response.data.message.content;
    if (callBackUpdate) {
      callBackUpdate(fullResponse);
    }

    return fullResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    if (axios.isCancel(error)) {
      console.error("Request timed out");
      throw new Error("Request timed out");
    }
    console.error("Error:", error.message);
    throw error;
  }
}

// Example usage:
// (async () => {
//   try {
//     const finalText = await chatCompletionAPI(
//       {
//         query: "Why is the sky blue?",
//         prompt: "You are a helpful assistant.",
//         baseUrl: "http://localhost:11434"
//       },
//       (response) => {
//         console.log("Received response:", response);
//       },
//       30000 // 30 seconds timeout
//     );
//     console.log("\nFinal complete response:", finalText);
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// })();
