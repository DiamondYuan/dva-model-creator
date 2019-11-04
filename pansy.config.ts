import { Config } from '@pansy/cli';

const config: Config = {
  banner: true,
  output: {
    format: ['cjs', 'es', 'umd', 'umd-min'],
    moduleName: 'vtils',
    sourceMap: true,
  },
};

export default config;