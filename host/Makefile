EMFLAGS := -sMAIN_MODULE=2 \
					 -sFORCE_FILESYSTEM \
					 -sSINGLE_FILE=1 \
					 -sIMPORTED_MEMORY=1 \
					 -sENVIRONMENT=web,worklet \
					 -sMIN_FIREFOX_VERSION=156 \
					 -sEXPORTED_RUNTIME_METHODS=FS,ccall,stringToUTF8,UTF8ToString \
					 -sINCOMING_MODULE_JS_API=wasmMemory \
					 -sEXPORTED_FUNCTIONS=_malloc,_free \
					 --use-port=../ports/lv2.py

host.mjs: host.c
	emcc $(CFLAGS) $(EMFLAGS) -o $@ $<

run: host.html host.mjs
	emrun host.html

clean:
	rm -rf host.mjs host.wasm
