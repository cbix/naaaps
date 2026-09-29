import os

TAG = '1.18.10'
HASH = 'ab4bcf593f633b1ed16c0eb6aa4525458a00655ef9c87619bf85eaa966f8fd094a8e871b825f679e0d97923f8bbbf11841ff467022390ca2f1a5b5f66ccd5d1b'

URL = 'https://lv2plug.in/'
DESCRIPTION = 'LV2 specs and headers'
LICENSE = 'ISC'


def get(ports, settings, shared):
    ports.fetch_project(
        'lv2', f'https://lv2plug.in/spec/lv2-{TAG}.tar.xz', sha512hash=HASH)

    def create(final):
        # includes
        source_path = ports.get_dir('lv2', f'lv2-{TAG}')
        include_path = os.path.join(source_path, 'include', 'lv2')
        ports.install_header_dir(include_path)
        ports.install_headers(os.path.join(
            include_path, 'core'), pattern='lv2.h')

        # write dummy.c file to output empty .a
        dummy_file = os.path.join(source_path, 'dummy.c')
        shared.safe_ensure_dirs(os.path.dirname(dummy_file))
        ports.write_file(dummy_file, 'void dummy() {}')

        ports.build_port(source_path, final, 'lv2', srcs=['dummy.c'])

    return [shared.cache.get_lib('liblv2.a', create, what='port')]


def clear(ports, settings, shared):
    shared.cache.erase_lib('liblv2.a')
