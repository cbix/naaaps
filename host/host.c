#include <dlfcn.h>
// #include <emscripten.h>
#include <emscripten/em_math.h>
#include <emscripten/webaudio.h>
#include <lv2.h>
#include <string.h>

uint8_t audioThreadStack[4096];

void get_name(char *path, char *name) {
  void *lib = dlopen(path, RTLD_NOW);
  LV2_Descriptor_Function get_descriptor = dlsym(lib, "lv2_descriptor");
  const LV2_Descriptor *desc = get_descriptor(0);
  strcpy(name, desc->URI);
  dlclose(lib);
}

int main() {
  EMSCRIPTEN_WEBAUDIO_T context = emscripten_create_audio_context(0);

  emscripten_start_wasm_audio_worklet_thread_async(context, audioThreadStack,
                                                   sizeof(audioThreadStack),
                                                   &AudioThreadInitialized, 0);
}

void AudioThreadInitialized(EMSCRIPTEN_WEBAUDIO_T audioContext, bool success,
                            void *userData) {
  if (!success)
    return; // Check browser console in a debug build for detailed errors
  WebAudioWorkletProcessorCreateOptions opts = {
      .name = "noise-generator",
  };
  emscripten_create_wasm_audio_worklet_processor_async(
      audioContext, &opts, &AudioWorkletProcessorCreated, 0);
}

void AudioWorkletProcessorCreated(EMSCRIPTEN_WEBAUDIO_T audioContext,
                                  bool success, void *userData) {
  if (!success)
    return; // Check browser console in a debug build for detailed errors

  int outputChannelCounts[1] = {1};
  EmscriptenAudioWorkletNodeCreateOptions options = {.numberOfInputs = 0,
                                                     .numberOfOutputs = 1,
                                                     .outputChannelCounts =
                                                         outputChannelCounts};

  // Create node
  EMSCRIPTEN_WEBAUDIO_T wasmAudioWorklet =
      emscripten_create_wasm_audio_worklet_node(audioContext, "noise-generator",
                                                &options, &GenerateNoise, 0);

  // Connect it to audio context destination
  emscripten_audio_node_connect(wasmAudioWorklet, audioContext, 0, 0);

  // Resume context on mouse click
  emscripten_set_click_callback("canvas", (void *)audioContext, 0,
                                OnCanvasClick);
}

bool OnCanvasClick(int eventType, const EmscriptenMouseEvent *mouseEvent,
                   void *userData) {
  EMSCRIPTEN_WEBAUDIO_T audioContext = (EMSCRIPTEN_WEBAUDIO_T)userData;
  if (emscripten_audio_context_state(audioContext) !=
      AUDIO_CONTEXT_STATE_RUNNING) {
    emscripten_resume_audio_context_sync(audioContext);
  }
  return false;
}

bool GenerateNoise(int numInputs, const AudioSampleFrame *inputs,
                   int numOutputs, AudioSampleFrame *outputs, int numParams,
                   const AudioParamFrame *params, void *userData) {
  for (int i = 0; i < numOutputs; ++i)
    for (int j = 0;
         j < outputs[i].samplesPerChannel * outputs[i].numberOfChannels; ++j)
      outputs[i].data[j] = emscripten_random() * 0.2 -
                           0.1; // Warning: scale down audio volume by factor of
                                // 0.2, raw noise can be really loud otherwise

  return true; // Keep the graph output going
}
