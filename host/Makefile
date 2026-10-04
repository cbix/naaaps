EMFLAGS := -sMAIN_MODULE=2 \
					 -sFORCE_FILESYSTEM \
					 -sENVIRONMENT=web \
					 -sEXPORTED_RUNTIME_METHODS=FS,ccall,stringToUTF8,UTF8ToString \
					 -sEXPORTED_FUNCTIONS=_malloc,_free,_get_name \
					 -sAUDIO_WORKLET \
					 -sWASM_WORKERS \
					 --use-port=../ports/lv2.py

host.js: host.c
	emcc $(CFLAGS) $(EMFLAGS) -o $@ $<

run: host.html host.js
	emrun host.html

clean:
	rm -rf host.js host.wasm
