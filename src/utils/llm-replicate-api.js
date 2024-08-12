import axios from "axios";

export async function chatCompletionReplicate(
  userInput,
  systemPrompt,
  replicateKey,
  modelPath = "meta/meta-llama-3.1-405b-instruct",
  callBackUpdate
) {
  const url = `https://api.replicate.com/v1/models/${modelPath}/predictions`;

  const promptTemplate = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

  const data = {
    input: {
      top_k: 50,
      top_p: 0.9,
      prompt: userInput,
      max_tokens: 512,
      min_tokens: 0,
      temperature: 0.6,
      prompt_template: promptTemplate,
      presence_penalty: 1.15,
      frequency_penalty: 0.2,
    },
  };

  try {
    const { data: responseData } = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${replicateKey}`,
        "Content-Type": "application/json",
      },
    });
    const urlPrediction = responseData?.urls?.get;
    if (!urlPrediction) {
      throw new Error(
        "No URL get found in the response data:" + JSON.stringify(responseData)
      );
    }
    const predictionData = await getPredictionChatCompletion(
      urlPrediction,
      replicateKey,
      callBackUpdate
    );
    return await predictionData.output.join("");
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    throw error;
  }
}

async function getPredictionChatCompletion(
  urlPrediction,
  replicateKey,
  callBackUpdate = undefined
) {
  let status = "processsing";
  let startedAt = new Date().toISOString();
  let data;
  let tries = 1;
  // while status is not succeeded keep doing axios
  while (status !== "succeeded") {
    // console .log the request and the count of reqest / wait time out
    console.log(
      "Making request: " +
        JSON.stringify({ status, startedAt, urlPrediction, tries })
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { data: resData } = await axios.get(urlPrediction, {
      headers: {
        Authorization: `Bearer ${replicateKey}`,
      },
    });
    if (callBackUpdate !== undefined) {
      callBackUpdate(resData.output.join(""));
    }
    data = resData;
    status = data.status;
    startedAt = data.started_at;
    tries = tries + 1;
  }

  return data;
}
