"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const assert_1 = __importDefault(require("assert"));
const collect_files_js_1 = __importDefault(require("mocha/lib/cli/collect-files.js"));
const aggregate_error_1 = __importDefault(require("aggregate-error"));
const ansi_escapes_1 = __importDefault(require("ansi-escapes"));
const mocha_1 = require("./lib/mocha");
const webpack_1 = require("./lib/webpack");
async function instantMocha(options) {
    assert_1.default(options.webpackConfig, 'Webpack configuration path must be passed in');
    const webpackConfigPath = path_1.default.resolve(options.webpackConfig);
    assert_1.default(fs_1.default.existsSync(webpackConfigPath), `Invalid Webpack configuration path: ${webpackConfigPath}`);
    let webpackConfig;
    try {
        // eslint-disable-next-line node/global-require
        webpackConfig = require(webpackConfigPath);
    }
    catch {
        throw new Error(`Faild to load Webpack configuration: ${webpackConfigPath}`);
    }
    const testFiles = collect_files_js_1.default({
        ignore: [],
        file: [],
        ...options,
    });
    const webpackCompiler = webpack_1.createWebpackCompiler(webpackConfig, testFiles);
    if (options.watch) {
        webpackCompiler.watch({}, async (error, stats) => {
            process.stdout.write(ansi_escapes_1.default.clearTerminal);
            if (error) {
                console.log(error);
                return;
            }
            if (stats.hasErrors()) {
                console.log(new aggregate_error_1.default(stats.compilation.errors));
                return;
            }
            if (stats.hasWarnings()) {
                for (const warning of stats.compilation.warnings) {
                    console.log(warning);
                }
            }
            await mocha_1.runMocha(options);
        });
    }
    else {
        await webpackCompiler.$run();
        return await mocha_1.runMocha(options);
    }
}
exports.default = instantMocha;
