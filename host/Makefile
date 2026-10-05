EMFLAGS := -sMAIN_MODULE=2 \
					 -sFORCE_FILESYSTEM \
					 -sSINGLE_FILE=1 \
					 -sENVIRONMENT=worklet \
					 -sEXPORTED_RUNTIME_METHODS=FS,ccall,stringToUTF8,UTF8ToString \
					 -sEXPORTED_FUNCTIONS=_malloc,_free,_get_name \
					 --use-port=../ports/lv2.py

host.mjs: host.c
	emcc $(CFLAGS) $(EMFLAGS) -o $@ $<

run: host.html host.mjs
	emrun host.html

clean:
	rm -rf host.mjs host.wasm
