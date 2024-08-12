import axios from "axios";

const proxyPOSTUrls = [
  "https://cors-anywhere.herokuapp.com/",
  "https://thingproxy.freeboard.io/fetch/",
];

const proxyGetUrls = [
  //   "https://corsproxy.io/?",
  //   "https://api.allorigins.win/raw?url=",
  "https://app.cors.bridged.cc/",
  //   "https://everyorigin.jwvbremen.nl/get?url=",
  //   "https://every-origin.vercel.app/get?url=",
];

function getProxyUrl(proxyUrls) {
  // Get the current timestamp in milliseconds
  const timestamp = Date.now();

  // Convert the timestamp to a string and extract the first digit
  const firstDigit = Number(String(timestamp).slice(-1));

  // Calculate the index based on the first digit and the length of the proxyUrls array
  const index = firstDigit % proxyUrls.length;
  // Return the proxy URL based on the calculated index
  return proxyUrls[index];
}

function getProxyPOSTUrl(url, proxyUrls = proxyPOSTUrls) {
  const randomProxyUrl = getProxyUrl(proxyUrls);
  console.log("getProxyPOSTUrl", randomProxyUrl);
  return randomProxyUrl + url;
}

function getProxyGETUrl(url, proxyUrls = proxyGetUrls) {
  const randomProxyUrl = getProxyUrl(proxyUrls);
  console.log("getProxyPOSTUrl", randomProxyUrl);
  return randomProxyUrl + encodeURIComponent(url);
}

export async function chatCompletionReplicate(
  userInput,
  systemPrompt,
  replicateKey,
  modelPath = "meta/meta-llama-3.1-405b-instruct",
  callBackUpdate
) {
  const url = getProxyPOSTUrl(
    `https://api.replicate.com/v1/models/${modelPath}/predictions`
  );
  const data = {
    input: {
      top_k: 50,
      top_p: 0.9,
      prompt: userInput,
      max_tokens: 9999,
      min_tokens: 0,
      temperature: 0.6,
      system_prompt: systemPrompt,
      presence_penalty: 1.15,
      frequency_penalty: 0.2,
    },
  };
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
  await new Promise((resolve) => setTimeout(resolve, 1000));
  let status = "processsing";
  let startedAt = new Date().toISOString();
  let data;
  let tries = 1;
  // while status is not succeeded keep doing axios
  while (status !== "succeeded") {
    const url = getProxyPOSTUrl(urlPrediction);
    // console .log the request and the count of reqest / wait time out
    console.log(
      "Making request: " +
        JSON.stringify({ status, startedAt, urlPrediction, tries })
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { data: resData } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${replicateKey}`,
      },
      mode: "no-cors",
    });
    if (callBackUpdate !== undefined) {
      callBackUpdate(resData.output.join(""));
    }
    data = resData;
    status = data.status;
    if (status == "failed") {
      throw new Error("Failed to get response from replicate:", data);
    }
    startedAt = data.started_at;
    tries = tries + 1;
  }
  console.log("Done making repicate request", data);
  return data;
}
