"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMocha = void 0;
const path_1 = __importDefault(require("path"));
const mocha_1 = __importDefault(require("mocha"));
const suite_js_1 = __importDefault(require("mocha/lib/suite.js"));
const memfs_1 = require("./memfs");
function createMochaInstance(mochaOptions) {
    const mocha = new mocha_1.default(mochaOptions);
    function $run() {
        return new Promise((resolve) => {
            this.run.call(this, resolve);
        });
    }
    mocha.$run = $run;
    // @ts-expect-error overwriting private prototpe method
    mocha.loadFiles = function loadFiles(callback) {
        const { suite, files, } = this;
        for (let file of files) {
            file = path_1.default.resolve(file);
            suite.emit(suite_js_1.default.constants.EVENT_FILE_PRE_REQUIRE, global, file, this);
            suite.emit(suite_js_1.default.constants.EVENT_FILE_REQUIRE, memfs_1.mRequire(file), file, this);
            suite.emit(suite_js_1.default.constants.EVENT_FILE_POST_REQUIRE, global, file, this);
        }
        if (typeof callback === 'function') {
            callback();
        }
    };
    return mocha;
}
async function runMocha(options) {
    const mocha = createMochaInstance(options);
    mocha.files = ['/main.js'];
    return await mocha.$run();
}
exports.runMocha = runMocha;
