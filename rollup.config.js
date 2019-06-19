import rollupTypescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';

const globals = {
  redux: 'Redux',
  'redux-saga': 'ReduxSaga',
  history: 'History',
};

export default [
  // UMD Development
  {
    input: ['src/index.ts'],
    output: {
      file: 'dist/dva-model-creator.js',
      format: 'umd',
      name: 'DvaModelCreator',
      indent: false,
      sourcemap: true,
      globals,
    },
    external: Object.getOwnPropertyNames(globals),
    plugins: [
      rollupTypescript(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      filesize(),
    ],
  },

  // UMD Production
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/dva-model-creator.min.js',
      format: 'umd',
      name: 'DvaModelCreator',
      indent: false,
      sourcemap: true,
      globals,
    },
    external: Object.getOwnPropertyNames(globals),
    plugins: [
      rollupTypescript(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
      filesize(),
    ],
  },
];
