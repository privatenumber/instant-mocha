"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebpackCompiler = void 0;
const module_1 = __importDefault(require("module"));
const webpack_1 = __importDefault(require("webpack"));
const aggregate_error_1 = __importDefault(require("aggregate-error"));
const memfs_1 = require("./memfs");
function createWebpackCompiler(webpackConfig, testFiles) {
    const config = {
        ...webpackConfig,
        entry: testFiles,
        // Yields unexpected behavior in certain loaders
        // eg. vue-loader will build in SSR mode
        // target: 'node',
        output: {
            path: '/',
            // https://stackoverflow.com/a/64715069
            publicPath: '',
            // For Node.js env
            // https://webpack.js.org/configuration/output/#outputglobalobject
            globalObject: 'this',
            libraryTarget: 'commonjs2',
        },
    };
    // Externalize Node built-in modules
    if (webpack_1.default.version && webpack_1.default.version[0] > '4') {
        if (!config.externalsPresets) {
            config.externalsPresets = {};
        }
        config.externalsPresets.node = true;
    }
    else {
        if (!config.externals) {
            config.externals = [];
        }
        else if (!Array.isArray(config.externals)) {
            config.externals = [config.externals];
        }
        config.externals.push(...module_1.default.builtinModules);
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
