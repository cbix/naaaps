#include <dlfcn.h>
#include <emscripten.h>
#include <lv2.h>
#include <string.h>

void get_name(char *path, char *name) {
  void *lib = dlopen(path, RTLD_NOW);
  LV2_Descriptor_Function get_descriptor = dlsym(lib, "lv2_descriptor");
  const LV2_Descriptor *desc = get_descriptor(0);
  strcpy(name, desc->URI);
  dlclose(lib);
}
