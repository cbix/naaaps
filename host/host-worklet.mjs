import Module from "./host.mjs";

console.log("lv2-processor worklet started");

const module = await Module();

class LV2Processor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    console.log("creating LV2Processor", options);
    const inPtr = module._malloc(200);
    const outPtr = module._malloc(200);
    const file = options.processorOptions;

    console.log("reading", file.name);
    module.FS.writeFile(file.name, new Uint8Array(file.data));
    module.stringToUTF8(file.name, inPtr, 200);
    module.ccall("get_name", null, ["number", "number"], [inPtr, outPtr]);

    this.port.postMessage(module.UTF8ToString(outPtr));

    module._free(inPtr);
    module._free(outPtr);
  }

  process(inputs, outputs, parameters) {
    return true;
  }
}

registerProcessor("lv2-processor", LV2Processor);

console.log("lv2-processor registered");
