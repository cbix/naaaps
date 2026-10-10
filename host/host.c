#include <dlfcn.h>
#include <emscripten.h>
#include <lv2.h>

EMSCRIPTEN_KEEPALIVE
void *naaaps_lv2_load(char *path) { return dlopen(path, RTLD_NOW); }

EMSCRIPTEN_KEEPALIVE
int naaaps_lv2_unload(void *lib) { return dlclose(lib); }

EMSCRIPTEN_KEEPALIVE
const LV2_Descriptor *naaaps_lv2_descriptor(void *lib, uint32_t index) {
  LV2_Descriptor_Function get_descriptor = dlsym(lib, "lv2_descriptor");
  return get_descriptor(index);
}

EMSCRIPTEN_KEEPALIVE
const char *naaaps_lv2_get_uri(const LV2_Descriptor *desc) { return desc->URI; }
