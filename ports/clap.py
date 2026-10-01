import os

TAG = '1.2.10'
HASH = '22c0de322ed48fea0011756864e4a0e5df838dc5554f0d8671dc9cbe3d888b0116ecb55b7ceee55a1735a65163d25745915e0164ab1624d1213ab72dd9ab7cb9'

URL = 'https://github.com/free-audio/clap'
DESCRIPTION = 'CLAP audio plugin standard headers'
LICENSE = 'MIT'


def get(ports, settings, shared):
    ports.fetch_project(
        'clap', f'https://github.com/free-audio/clap/archive/refs/tags/{TAG}.tar.gz', sha512hash=HASH)

    def create(final):
        # includes
        source_path = ports.get_dir('clap', f'clap-{TAG}')
        include_path = os.path.join(source_path, 'include', 'clap')
        ports.install_header_dir(include_path)
        ports.make_pkg_config('clap', TAG, '')

        # write dummy.c file to output empty .a
        dummy_file = os.path.join(source_path, 'dummy.c')
        shared.safe_ensure_dirs(os.path.dirname(dummy_file))
        ports.write_file(dummy_file, 'void dummy() {}')

        ports.build_port(source_path, final, 'clap', srcs=['dummy.c'])

    return [shared.cache.get_lib('libclap.a', create, what='port')]


def clear(ports, settings, shared):
    shared.cache.erase_lib('libclap.a')
