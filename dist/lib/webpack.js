"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebpackCompiler = void 0;
const webpack_1 = __importDefault(require("webpack"));
const aggregate_error_1 = __importDefault(require("aggregate-error"));
const memfs_1 = require("./memfs");
function createWebpackCompiler(webpackConfig, testFiles) {
    var _a, _b;
    const config = { ...webpackConfig };
    config.entry = testFiles;
    config.output = {
        ...webpackConfig.output,
        path: '/',
        // https://stackoverflow.com/a/64715069
        publicPath: '',
        // For Node.js env
        // https://webpack.js.org/configuration/output/#outputglobalobject
        globalObject: 'this',
        libraryTarget: 'commonjs2',
    };
    if (!Array.isArray(config.externals)) {
        const { externals } = config;
        config.externals = [];
        if (externals) {
            config.externals.push(externals);
        }
    }
    if (((_a = webpack_1.default.version) === null || _a === void 0 ? void 0 : _a.split('.')[0]) > '4') {
        // Externalize Node built-in modules
        if (!config.externalsPresets) {
            config.externalsPresets = {};
        }
        config.externalsPresets.node = true;
        // Same as target: 'node' for async loading chunks
        Object.assign(config.output, {
            chunkLoading: 'require',
            chunkFormat: 'commonjs',
        });
    }
    else {
        /**
         * Applied when target = 'node'
         * https://github.com/webpack/webpack/blob/v4.0.0/lib/WebpackOptionsApply.js#L107
         *
         * Can't add target = 'node' because it can affect other plugins (eg. vue-loader)
         *
         * These externalize Node.js builtins and makes chunks load in CommonJS
         * https://github.com/webpack/webpack/blob/v4.0.0/lib/node/NodeTemplatePlugin.js
         */
        /* eslint-disable @typescript-eslint/no-var-requires,node/global-require,import/no-unresolved */
        const LoaderTargetPlugin = require('webpack/lib/LoaderTargetPlugin');
        const FunctionModulePlugin = require('webpack/lib/FunctionModulePlugin');
        const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');
        const ReadFileCompileWasmTemplatePlugin = require('webpack/lib/node/ReadFileCompileWasmTemplatePlugin');
        const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
        /* eslint-enable @typescript-eslint/no-var-requires,node/global-require,import/no-unresolved */
        const target = (_b = config.target) !== null && _b !== void 0 ? _b : 'web';
        // @ts-expect-error WP4 accepts functions
        config.target = (compiler) => {
            // CJS Chunks
            new NodeTemplatePlugin().apply(compiler);
            new ReadFileCompileWasmTemplatePlugin(config.output).apply(compiler);
            new FunctionModulePlugin(config.output).apply(compiler);
            // Externalize builtins
            new NodeTargetPlugin().apply(compiler);
            // Tells loader what the target is
            // We don't want to influence this
            new LoaderTargetPlugin(target).apply(compiler);
        };
    }
    const compiler = webpack_1.default(config);
    compiler.outputFileSystem = memfs_1.mfs;
    function $run() {
        return new Promise((resolve, reject) => {
            this.run((error, stats) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stats.hasErrors()) {
                    reject(new aggregate_error_1.default(stats.compilation.errors));
                    return;
                }
                if (stats.hasWarnings()) {
                    for (const warning of stats.compilation.warnings) {
                        console.log(warning);
                    }
                }
                resolve(stats);
            });
        });
    }
    compiler.$run = $run;
    return compiler;
}
exports.createWebpackCompiler = createWebpackCompiler;
