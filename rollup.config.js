import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import builtins from 'builtin-modules'

const rollupPeers = [
  'erlpack',
  'uws',
  'opusscript',
  'node-opus',
  'ffmpeg-binaries',
  'cls-hooked'
]

module.exports = {
  input: 'src/index.ts',
  external: builtins.concat(rollupPeers),
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    }
  ],
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs({
      namedExports: {
        'cls-hooked': ['createNamespace']
      },
      ignore: rollupPeers
    }),
    json()
  ],
  onwarn: function ( message, warn ) {
    if (message.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }
    warn(message);
  }
};
