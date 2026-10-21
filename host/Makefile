EMFLAGS := -sMAIN_MODULE=2 \
					 -sDYLINK_DEBUG=1 \
					 -sFORCE_FILESYSTEM \
					 -sSINGLE_FILE=1 \
					 -sIMPORTED_MEMORY=1 \
					 -pthread \
					 -sINITIAL_MEMORY=64MB \
					 -sMAXIMUM_MEMORY=256MB \
					 -sALLOW_MEMORY_GROWTH=1 \
					 -sENVIRONMENT=web,worklet \
					 -sMIN_FIREFOX_VERSION=156 \
					 --use-port=../ports/lv2.py \
					 -sEXPORTED_RUNTIME_METHODS=FS,ccall,STACK_SIZE,stackRestore \
					 -sEXPORTED_FUNCTIONS=_malloc,_free,__dlopen_js

host.mjs: host.c
	emcc $(CFLAGS) $(EMFLAGS) -v -o $@ $<

run: host.html host.mjs
	emrun host.html

clean:
	rm -rf host.mjs host.wasm
