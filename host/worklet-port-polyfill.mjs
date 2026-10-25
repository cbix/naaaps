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
