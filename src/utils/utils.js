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
  const query = window.location.search.substring(1);
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

export async function fetchAndCache(url, callbackSetProgressText) {
  try {
    const cache = await caches.open("onnx");
    let cachedResponse = await cache.match(url);
    if (cachedResponse === undefined) {
      console.log(`${url} (network)`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }

      const contentLength = response.headers.get("content-length");
      if (!contentLength) {
        throw new Error("Content-Length response header is missing");
      }

      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body.getReader();
      const stream = new ReadableStream({
        start(controller) {
          function push() {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }

                loaded += value.byteLength;
                const progress = (loaded / total) * 100;
                callbackSetProgressText(progress.toPrecision(4) + "%");

                controller.enqueue(value);
                push();
              })
              .catch((error) => {
                console.error(error);
                controller.error(error);
              });
          }

          push();
        },
      });

      const newResponse = new Response(stream, {
        headers: { "Content-Type": response.headers.get("Content-Type") },
      });

      const buffer = await newResponse.arrayBuffer();

      try {
        await cache.put(url, new Response(buffer));
      } catch (error) {
        console.error(error);
      }
      return buffer;
    }

    console.log(`${url} (cached)`);
    const data = await cachedResponse.arrayBuffer();
    return data;
  } catch (error) {
    console.error(`can't fetch ${url}`);
    throw error;
  }
}
