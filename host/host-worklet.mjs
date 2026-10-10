import Module from "./host.mjs";

console.log("lv2-processor worklet started");

let module;

port.onmessage = async (ev) => {
  console.log("worklet port message", ev.data);
  if ("buf" in ev.data) {
    const view = new DataView(ev.data.buf);
    console.log("buf value", view.getFloat64(0));
  }
  if ("memory" in ev.data) {
    module = await Module({ memory });
    console.log("worklet: wasm instance", module);
  }
};

class LV2Processor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    console.log("creating LV2Processor", options);
    const inPtr = module._malloc(200);
    const outPtr = module._malloc(200);
    const { ...file } = options.processorOptions;

    console.log("reading", file.name);
    module.FS.writeFile(file.name, new Uint8Array(file.data));
    module.stringToUTF8(file.name, inPtr, 200);
    module.ccall("get_name", null, ["number", "number"], [inPtr, outPtr]);

    this.uri = module.UTF8ToString(outPtr);
    this.port.postMessage(this.uri);

    module._free(inPtr);
    module._free(outPtr);
  }

  process(inputs, outputs, parameters) {
    return true;
  }
}

registerProcessor("lv2-processor", LV2Processor);

console.log("lv2-processor registered");
