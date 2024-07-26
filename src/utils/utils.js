export const MODELS = {
  phi3: {
    name: "phi3",
    path: "microsoft/Phi-3-mini-4k-instruct-onnx-web",
    externaldata: true,
  },
  phi3dev: {
    name: "phi3dev",
    path: "schmuell/Phi-3-mini-4k-instruct-onnx-web",
    externaldata: true,
  },
};

export function getConfig() {
  const query = "";
  // const query = window.location.search.substring(1);
  var config = {
    model: "phi3",
    provider: "webgpu",
    profiler: 0,
    verbose: 0,
    threads: 1,
    show_special: 0,
    csv: 0,
    max_tokens: 9999,
    local: 0,
  };
  let vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] in config) {
      const key = pair[0];
      const value = decodeURIComponent(pair[1]);
      if (typeof config[key] == "number") {
        config[key] = parseInt(value);
      } else {
        config[key] = value;
      }
    } else if (pair[0].length > 0) {
      throw new Error("unknown argument: " + pair[0]);
    }
  }
  if (MODELS[config.model] !== undefined) {
    config.model = MODELS[config.model];
  }
  return config;
}

export async function hasWebGPU() {
  if (!("gpu" in navigator)) {
    return 2;
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter.features.has("shader-f16")) {
      return 0;
    }
    return 1;
  } catch (e) {
    return 2;
  }
}

export async function fetchAndCache(
  url,
  callbackSetProgressText,
  addText = ""
) {
  const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  const cache = await caches.open("onnx");

  try {
    // Step 1: Check cache first
    const cachedResponse = await cache.match(url);
    if (cachedResponse) {
      console.log(`${url} (cached)`);
      return cachedResponse.arrayBuffer();
    }

    console.log(`${url} (network)`);

    // Step 2: Fetch the resource
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    // Step 3: Get content length and prepare for download
    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;
    let lastReportedProgress = 0;

    // Step 4: Handle large files with streaming
    if (total > CHUNK_SIZE) {
      const chunks = [];
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        // Step 5: Calculate and report progress
        if (total) {
          const currentProgress = Math.floor((loaded / total) * 100);
          if (currentProgress > lastReportedProgress) {
            callbackSetProgressText(currentProgress + "% " + addText);
            lastReportedProgress = currentProgress;
          }
        }
      }

      // Step 6: Combine chunks and cache
      const arrayBuffer = await new Blob(chunks).arrayBuffer();
      await cache.put(url, new Response(arrayBuffer.slice(0)));
      return arrayBuffer;
    } else {
      // Step 7: Handle smaller files
      const arrayBuffer = await response.arrayBuffer();
      await cache.put(url, new Response(arrayBuffer.slice(0)));
      return arrayBuffer;
    }
  } catch (error) {
    console.error(`Can't fetch ${url}:`, error);
    throw error;
  }
}
