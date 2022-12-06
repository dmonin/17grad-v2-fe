import strip from '@rollup/plugin-strip';
import filesize from 'rollup-plugin-filesize';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import clear from 'rollup-plugin-clear';
import visualizer from 'rollup-plugin-visualizer';
import alias from '@rollup/plugin-alias';

import { nodeResolve } from '@rollup/plugin-node-resolve';


export default [
  {
    input: 'src/frontend/main.js',
    preserveEntrySignatures: false,
    plugins: [
      clear({
        targets: ['public/js']
      }),
      strip({
        debugger: true
      }),
      alias({
        entries: [
          { find: 'https://unpkg.com/ogl', replacement: 'ogl' }
        ]
      }),
      nodeResolve(),
      // terser({
      //   toplevel: true
      // }),
      compiler({
        // compilation_level: 'ADVANCED',
        // formatting: 'PRETTY_PRINT'
      }),
      visualizer({
        filename: 'stats/stats.html',
        title: '17GRAD Module Stats',
        gzipSize: true,
        brotliSize: true
      }),
      filesize()
    ],
    output: [
      {
        dir: 'public/js',
        compact: true,
        format: "es",
        manualChunks: {
          'core': [
            './src/frontend/views/index-view.js',
            './src/frontend/math/lerp.js',
            './src/frontend/animation/scroll-to-top-animation.js',
            './src/frontend/animation/view-loading.js'
          ]
        }
      }
    ]
  }
];
