# emscripten ports

This directory contains build scripts for libraries which might be required
for building audio plugins. These ports should work with emscripten's
`--use-port` flag, for example:

```sh
emcc -shared --use-port=naaaps/ports/lv2.py -o plugin.wasm plugin.c
```
