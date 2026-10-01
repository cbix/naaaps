import os

TAG = '0.32.10'
HASH = '1ceb7caaa97195e829bec0436930c090698a6be8ba1b7ee0ef3f013c817dd7ae472bb9bcc271e55e8b6e12d110b2d1d3d8fe20c36672d6e63c53f151173cd897'

URL = 'https://drobilla.net/software/serd.html'
DESCRIPTION = 'Lightweight C library for RDF syntax supporting reading/writing Turtle and NTriples'
LICENSE = 'ISC'


def get(ports, settings, shared):
    ports.fetch_project(
        'serd', f'https://download.drobilla.net/serd-{TAG}.tar.xz', sha512hash=HASH)

    def create(final):
        # includes
        root_path = ports.get_dir('serd', f'serd-{TAG}')
        include_path = os.path.join(root_path, 'include', 'serd')
        ports.install_header_dir(include_path)
        ports.make_pkg_config('serd', TAG, '-lserd')

        # static library
        source_path = os.path.join(root_path, 'src')
        ports.build_port(source_path, final, 'serd')

    return [shared.cache.get_lib('libserd.a', create, what='port')]


def clear(ports, settings, shared):
    shared.cache.erase_lib('libserd.a')
