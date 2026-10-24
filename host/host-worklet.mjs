import Module from "./host.mjs";

// polyfill https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope/port
if (!(globalThis.port instanceof MessagePort)) {
  globalThis.port = await new Promise((resolve, reject) => {
    class BootstrapProcessor extends AudioWorkletProcessor {
      constructor() {
        super();
        this.port.onmessage = (ev) => {
          const [port] = ev.ports;
          if (port) {
            this.port.postMessage(true);
            resolve(port);
          } else {
            this.port.postMessage(false);
            reject(new Error("worklet received no message port"));
          }
        };
      }
      process() {}
    }
    registerProcessor("naaaps-bootstrap", BootstrapProcessor);
  });
}

let module;

async function initLV2(cfg) {
  module = await Module({ wasmMemory: cfg.memory });

  // set up individual stack in shared memory (inspired by emscripten's pthread implementation)
  const overflowCheck = module.getCompilerSetting("STACK_OVERFLOW_CHECK");
  const stackSize = module.STACK_SIZE;
  const stackLow = module._malloc(stackSize);
  if (!stackLow) {
    throw new Error("Error allocating stack");
  }
  const stackHigh = stackLow + stackSize;

  module._emscripten_stack_set_limits(stackHigh, stackLow);
  if (overflowCheck >= 2) {
    module.setStackLimits();
  }
  module.stackRestore(stackHigh);
  if (overflowCheck) {
    module.writeStackCookie();
  }

  console.log("worklet test_stack_var:", module._test_stack_var().toString(16));
}

async function loadLV2(cfg) {
  console.log("worklet load lv2");
  module.FS.writeFile(cfg.fileName, new Uint8Array(cfg.fileData));
  const res = module.__dlopen_js(cfg.lib);
  if (!res) {
    throw new Error("worklet load failed");
  }
  // TODO support multiple plugins
  // TODO async dlopen?

  class LV2Processor extends AudioWorkletProcessor {
    static lib = cfg.lib;

    constructor(options) {
      super(options);
      console.log("creating LV2Processor", options);
      const desc = module.ccall(
        "naaaps_lv2_descriptor",
        "number",
        ["number", "number"],
        [this.constructor.lib, 0],
      );
      const uri = module.ccall(
        "naaaps_lv2_get_uri",
        "string",
        ["number"],
        [desc],
      );
      this.port.postMessage({ desc, uri });
      this.desc = desc;
      this.uri = uri;
      console.log("worklet plugin created", desc, uri);
    }

    process(inputs, outputs, parameters) {
      return true;
    }
  }

  registerProcessor(cfg.fileName, LV2Processor);

  port.postMessage({ msg: "ready" });

  console.log("lv2-processor registered", cfg.fileName);
}

const handlers = {
  "init-lv2": initLV2,
  "load-lv2": loadLV2,
};

globalThis.port.onmessage = async (ev) => {
  console.log("worklet port message", ev.data);
  const { msg, ...cfg } = ev.data;
  await handlers[msg]?.(cfg);
};
