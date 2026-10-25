import Module from "./host.mjs";

const PAGE = 64 * 1024;
const memory = new WebAssembly.Memory({
  initial: (64 * 1024 * 1024) / PAGE,
  maximum: (256 * 1024 * 1024) / PAGE,
  shared: true,
});
const module = await Module({ wasmMemory: memory });
window.module = module;
let node;
const bundleBtn = document.getElementById("bundle");
const play = document.getElementById("play");
const libpath = document.getElementById("libpath");
const plugins = document.getElementById("plugins");
const context = new AudioContext();

// polyfill https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet/port
if (!(context.audioWorklet.port instanceof MessagePort)) {
  await context.audioWorklet.addModule("worklet-port-polyfill.mjs");
  context.audioWorklet.port = await Promise.race([
    new Promise((_resolve, reject) =>
      setTimeout(reject, 50, new Error("polyfill timeout")),
    ),
    new Promise((resolve, reject) => {
      const chn = new MessageChannel();
      const bootstrapNode = new AudioWorkletNode(context, "naaaps-bootstrap");
      bootstrapNode.port.onmessage = (ev) => {
        if (ev.data) {
          resolve(chn.port1);
        } else {
          reject(new Error("worklet received no message port"));
        }
      };
      bootstrapNode.port.postMessage({ port: chn.port2 }, [chn.port2]);
    }),
  ]);
}

await context.audioWorklet.addModule("host-worklet.mjs");
context.audioWorklet.port.postMessage({ msg: "init-lv2", memory });

console.log("main test_stack_var:", module._test_stack_var().toString(16));

bundleBtn.addEventListener("click", async () => {
  const dirHandle = await window.showDirectoryPicker();
  const manifestHandle = await dirHandle.getFileHandle("manifest.ttl");
  const manifestFile = await manifestHandle.getFile();
});

libpath.addEventListener("change", async (ev) => {
  for (const file of ev.target.files) {
    const data = await file.arrayBuffer();
    module.FS.writeFile(file.name, new Uint8Array(data));

    const lib = module.ccall(
      "naaaps_lv2_load",
      "number",
      ["string"],
      [file.name],
    );
    console.log("main lv2 loaded", lib);

    context.audioWorklet.port.postMessage(
      {
        msg: "load-lv2",
        fileName: file.name,
        fileData: data,
        lib,
      },
      [data],
    );

    context.audioWorklet.port.onmessage = (ev) => {
      if (ev.data.msg !== "ready") {
        return;
      }

      node = new AudioWorkletNode(context, file.name);
      node.port.onmessage = (ev) => {
        console.log("node.onmessage", ev.data);
        console.log("recvd worklet desc", ev.data.desc);
        const li = document.createElement("li");
        li.textContent = ev.data.uri;
        plugins.appendChild(li);
        const workletUri = module.ccall(
          "naaaps_lv2_get_uri",
          "string",
          ["number"],
          [ev.data.desc],
        );
        console.log("recvd worklet uri", workletUri);

        const desc = module.ccall(
          "naaaps_lv2_descriptor",
          "number",
          ["number", "number"],
          [lib, 0],
        );
        console.log("main desc", desc);

        const mainUri = module.ccall(
          "naaaps_lv2_get_uri",
          "string",
          ["number"],
          [desc],
        );
        console.log("main uri", mainUri);
      };
    };
  }
});

play.addEventListener("click", async () => {
  context.resume();
});
