import Module from "./host.mjs";

console.log("lv2-processor worklet started");

let module;

port.onmessage = async (ev) => {
  console.log("worklet port message", ev.data);
  if ("buf" in ev.data) {
    const view = new DataView(ev.data.buf);
    console.log("buf value", view.getFloat64(0));
  }
  if ("memory" in ev.data && ev.data.memory instanceof WebAssembly.Memory) {
    console.log("worklet with shared memory");
    module = await Module({ wasmMemory: ev.data.memory });
  }
};

class LV2Processor extends AudioWorkletProcessor {
  constructor(options) {
    if (!module) {
      throw new Error("Module not initialized");
    }

    super();
    console.log("creating LV2Processor", options);
    const { ...file } = options.processorOptions;

    console.log("reading", file.name);
    module.FS.writeFile(file.name, new Uint8Array(file.data));
    const lib = module.ccall(
      "naaaps_lv2_load",
      "number",
      ["string"],
      [file.name],
    );
    console.log("worklet lv2 loaded", lib);
    const desc = module.ccall(
      "naaaps_lv2_descriptor",
      "number",
      ["number", "number"],
      [lib, 0],
    );
    const uri = module.ccall(
      "naaaps_lv2_get_uri",
      "string",
      ["number"],
      [desc],
    );
    this.port.postMessage({ lib, desc, uri });
    this.lib = lib;
    this.desc = desc;
    this.uri = uri;
  }

  process(inputs, outputs, parameters) {
    return true;
  }
}

registerProcessor("lv2-processor", LV2Processor);

console.log("lv2-processor registered");
