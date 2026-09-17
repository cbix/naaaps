CFLAGS := -I/usr/include

host.js: host.c
	emcc $(CFLAGS) -sMAIN_MODULE=2 -sFORCE_FILESYSTEM -sENVIRONMENT=web -sEXPORTED_RUNTIME_METHODS=FS,ccall,stringToUTF8,UTF8ToString -sEXPORTED_FUNCTIONS=_malloc,_free,_get_name -o $@ $<

run: host.html host.js
	emrun host.html

clean:
	rm -rf host.js host.wasm
