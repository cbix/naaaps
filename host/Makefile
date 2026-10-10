EMFLAGS := -sMAIN_MODULE=2 \
					 -sDYLINK_DEBUG=1 \
					 -sFORCE_FILESYSTEM \
					 -sSINGLE_FILE=1 \
					 -sIMPORTED_MEMORY=1 \
					 -sINITIAL_MEMORY=64MB \
					 -sMAXIMUM_MEMORY=256MB \
					 -sALLOW_MEMORY_GROWTH=1 \
					 -pthread \
					 -sENVIRONMENT=web,worklet \
					 -sMIN_FIREFOX_VERSION=156 \
					 -sEXPORTED_RUNTIME_METHODS=FS,ccall,stringToUTF8,UTF8ToString,wasmMemory,wasmTable \
					 -sEXPORTED_FUNCTIONS=_malloc,_free \
					 --use-port=../ports/lv2.py
					 #-sINCOMING_MODULE_JS_API=wasmMemory \

host.mjs: host.c
	emcc $(CFLAGS) $(EMFLAGS) -o $@ $<

run: host.html host.mjs
	emrun host.html

clean:
	rm -rf host.mjs host.wasm
