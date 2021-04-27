"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mRequire = exports.mfs = void 0;
const module_1 = __importDefault(require("module"));
const path_1 = __importDefault(require("path"));
const memfs_1 = require("memfs");
const source_map_support_1 = __importDefault(require("source-map-support"));
class NodeModule extends module_1.default {
}
exports.mfs = memfs_1.createFsFromVolume(new memfs_1.Volume());
// @ts-expect-error To support Webpack 4. No longer needed in WP5
exports.mfs.join = path_1.default.join;
source_map_support_1.default.install({
    environment: 'node',
    retrieveFile(filePath) {
        if (exports.mfs.existsSync(filePath)) {
            return exports.mfs.readFileSync(filePath).toString();
        }
    },
});
const mRequire = (modulePath) => {
    const virtualModule = new module_1.default(modulePath, module);
    const moduleSource = exports.mfs.readFileSync(modulePath).toString();
    virtualModule._compile(moduleSource, modulePath);
    return virtualModule.exports;
};
exports.mRequire = mRequire;
const memWebpackEntry = '/main.js';
function hasMemFsInCallStack(parentModule) {
    while (parentModule.id !== memWebpackEntry && parentModule.parent) {
        parentModule = parentModule.parent;
    }
    return parentModule.id === memWebpackEntry;
}
const isFilePath = /^[./]/;
// Patch to support require() calls within test chunks (eg. dynamic-imports)
const { _load } = module_1.default;
module_1.default._load = function _memoryLoad(request, parent) {
    if (hasMemFsInCallStack(parent)) {
        // Resolve relative memfs path
        if (isFilePath.test(request)) {
            return exports.mRequire(path_1.default.resolve(parent.path, request));
        }
        // Resolve node module
        return Reflect.apply(_load, this, [request, module]);
    }
    // eslint-disable-next-line prefer-rest-params
    return Reflect.apply(_load, this, arguments);
};
