# PoC loading wasm-compiled LV2

Build any LV2 plugin to wasm32. Successfully tested with [airwindows-lv2](https://git.sr.ht/~hannes/airwindows-lv2) using

```
meson setup --cross-file path/to/naaaps/toolkit/meson/wasm32-emscripten.txt build
meson compile -C build
```

Build and run host:

```
make run
```

Select the plugin binary (`.so` or `.wasm`), it should print the first URI extracted from the plugin descriptor.
