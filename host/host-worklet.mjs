//import Module from "./host.mjs";

console.log("lv2-processor worklet started");

let module;

port.onmessage = async (ev) => {
  console.log("worklet port message", ev.data);
  if ("buf" in ev.data) {
    const view = new DataView(ev.data.buf);
    console.log("buf value", view.getFloat64(0));
  }
  if ("module" in ev.data) {
    console.log("worklet received module");
    module = ev.data.module;
  }
  if ("type" in ev.data && ev.data.type === "register-lv2") {
    // TODO support multiple plugins
    const { fileName, fileData, uri } = ev.data;
    if (!module) {
      throw new Error("Module not initialized");
    }
    module.FS.writeFile(fileName, new Uint8Array(fileData));
    const lib = module.ccall(
      "naaaps_lv2_load",
      "number",
      ["string"],
      [fileName],
    );
    console.log("worklet lv2 loaded", lib);

    class LV2Processor extends AudioWorkletProcessor {
      static lib = lib;

      constructor(options) {
        super(options);
        console.log("creating LV2Processor", options);
        this.desc = module.ccall(
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
      }

      process(inputs, outputs, parameters) {
        return true;
      }
    }

    registerProcessor(uri, LV2Processor);

    console.log("lv2-processor registered", uri);
  }
};
