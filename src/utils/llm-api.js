import axios from "axios";

export async function chatCompletionAPI(
  { query, prompt, baseUrl: apiUrlBaseLLM, model },
  callBackUpdate,
  timeoutMiliseconds
) {
  let accumulatedText = "";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMiliseconds);
  let isFirstToken = false;
  let firstToken = "";
  try {
    const response = await axios({
      method: "post",
      url: `${apiUrlBaseLLM}`,
      data: {
        model,
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
        stream: true,
      },
      responseType: "text",
      signal: controller.signal,
      onDownloadProgress: (progressEvent) => {
        let responseText =
          progressEvent?.event?.currentTarget?.responseText || "";

        if (
          progressEvent.event.currentTarget &&
          progressEvent.event.currentTarget.response
        ) {
          responseText = progressEvent.event.currentTarget.response;
        }
        // Fallback to progressEvent.target for compatibility
        else if (
          progressEvent.event.target &&
          progressEvent.event.target.responseText
        ) {
          responseText = progressEvent.event.target.responseText;
        }

        if (responseText) {
          const lines = responseText
            .split("\n")
            .filter((line) => line.trim() !== "")
            // last lines
            .slice(-1);

          for (const line of lines) {
            let toJsonLine = line.startsWith("data: ") ? line.slice(6) : line;
            try {
              const json = JSON.parse(toJsonLine);
              if (json.message && json.message.content) {
                accumulatedText += json.message.content;
                callBackUpdate(accumulatedText);
              }
            } catch (error) {
              console.error("Error parsing (data: tag) JSON:", error);
            }
          }
        }
      },
    });

    clearTimeout(timeoutId);
    return accumulatedText;
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
