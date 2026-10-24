EMFLAGS := -sMAIN_MODULE=2 \
					 -sRETAIN_COMPILER_SETTINGS=1 \
					 -sSTACK_OVERFLOW_CHECK=1 \
					 -sFORCE_FILESYSTEM \
					 -sSINGLE_FILE=1 \
					 -sIMPORTED_MEMORY=1 \
					 -pthread \
					 -sALLOW_MEMORY_GROWTH=1 \
					 -sENVIRONMENT=web,worklet \
					 -sMIN_FIREFOX_VERSION=156 \
					 --use-port=../ports/lv2.py \
					 -sEXPORTED_RUNTIME_METHODS=FS,ccall,STACK_SIZE,stackRestore,getCompilerSetting,writeStackCookie \
					 -sEXPORTED_FUNCTIONS=_malloc,_free,__dlopen_js,_emscripten_stack_set_limits
					 #-sDYLINK_DEBUG=1 \

host.mjs: host.c
	emcc $(CFLAGS) $(EMFLAGS) -v -o $@ $<

run: host.html host.mjs
	emrun host.html

clean:
	rm -rf host.mjs host.wasm
