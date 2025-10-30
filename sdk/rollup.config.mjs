import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default [
  // Browser-friendly UMD build (minified)
  {
    input: 'src/index.ts',
    output: {
      name: 'ArciumPrivacy',
      file: 'dist/arcium-privacy-sdk.min.js',
      format: 'umd',
      sourcemap: true,
      inlineDynamicImports: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json'
      }),
      terser({
        module: true,
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ],
    external: ['node-fetch']
  },
  // Browser-friendly UMD build (unminified)
  {
    input: 'src/index.ts',
    output: {
      name: 'ArciumPrivacy',
      file: 'dist/arcium-privacy-sdk.js',
      format: 'umd',
      sourcemap: true,
      inlineDynamicImports: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json'
      })
    ],
    external: ['node-fetch']
  },
  // CommonJS (for Node) build
  {
    input: 'src/index.ts',
    output: { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'named' },
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json'
      })
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      'node-fetch'
    ]
  },
  // ES module (for bundlers) build
  {
    input: 'src/index.ts',
    output: { file: pkg.module, format: 'es', sourcemap: true },
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json'
      })
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      'node-fetch'
    ]
  }
];