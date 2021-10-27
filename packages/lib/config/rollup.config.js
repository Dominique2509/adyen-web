import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import eslint from '@rollup/plugin-eslint';
import babel from '@rollup/plugin-babel';
import terserConfig from './terser.config';
import pkg from '../package.json';

const currentVersion = require('./version')();

if (process.env.CI !== 'true') {
    console.warn(
        '\x1b[33m%s\x1b[0m',
        'Warning: Building custom bundle. We recommend using one of the official builds served by our servers or NPM. Check https://docs.adyen.com/checkout for more information.'
    );
}

const isProduction = process.env.NODE_ENV === 'production';
const isBundleAnalyzer = process.env.NODE_ENV === 'analyze';

const input = 'src/index.ts';
const watchConfig = {
    chokidar: {
        usePolling: true,
        useFsEvents: false,
        interval: 500
    },
    exclude: 'node_modules/**'
};

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

async function getPlugins({ compress, analyze, version }) {
    return [
        resolve({ extensions }),
        commonjs(),
        eslint({
            include: ['./src/**'],
            exclude: ['./src/**/*.json', './src/**/*.scss']
        }),
        replace({
            values: {
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.VERSION': JSON.stringify(version.ADYEN_WEB_VERSION),
                'process.env.COMMIT_HASH': JSON.stringify(version.COMMIT_HASH),
                'process.env.COMMIT_BRANCH': JSON.stringify(version.COMMIT_BRANCH),
                'process.env.ADYEN_BUILD_ID': JSON.stringify(version.ADYEN_BUILD_ID)
            },
            preventAssignment: true
        }),
        babel({
            extensions,
            exclude: ['node_modules/**', '**/*.test.*'],
            ignore: [/core-js/, /@babel\/runtime/],
            presets: [
                ['@babel/preset-typescript',
                    {
                        isTSX: true,
                        allExtensions: true,
                        jsxPragma: 'h',
                        jsxPragmaFrag: 'Fragment'
                    }
                ],
                ['@babel/preset-react', {
                    pragma: 'h',
                    pragmaFrag: 'Fragment'
                }],
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            chrome: '58',
                            ie: '11'
                        }
                    }
                ]
            ],
            babelHelpers: 'runtime',
            plugins: [
                [
                    '@babel/plugin-transform-runtime',
                    {
                        corejs: 3
                    }
                ]
            ]
        }),
        json({ namedExports: false, compact: true, preferConst: true }),
        postcss({
            config: {
                path: 'config/postcss.config.js'
            },
            sourceMap: true,
            inject: false,
            extract: 'adyen.css'
        }),
        compress && (await import('rollup-plugin-terser')).terser(terserConfig),
        analyze &&
            (await import('rollup-plugin-visualizer')).default({
                title: 'Adyen Web bundle visualizer',
                gzipSize: true
            })
    ];
}

function getExternals() {
    const peerDeps = Object.keys(pkg.peerDependencies || {});
    const dependencies = Object.keys(pkg.dependencies || {});

    return [...peerDeps, ...dependencies];
}

export default async () => {
    const plugins = await getPlugins({
        compress: isProduction,
        analyze: isBundleAnalyzer,
        version: currentVersion
    });

    return [
        {
            input,
            external: getExternals(),
            plugins,
            output: [
                {
                    dir: 'dist/es',
                    format: 'es',
                    chunkFileNames: '[name].js',
                    ...(!isProduction ? { sourcemap: true } : {})
                },
                {
                    dir: 'dist/cjs',
                    format: 'cjs',
                    exports: 'auto',
                    inlineDynamicImports: true
                }
            ],
            watch: watchConfig
        },
        {
            input,
            plugins,
            output: {
                name: 'AdyenCheckout',
                file: pkg['umd:main'],
                format: 'umd',
                inlineDynamicImports: true,
                sourcemap: true
            },
            watch: watchConfig
        }
    ];
};
