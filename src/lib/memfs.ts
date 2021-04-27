import Module from 'module';
import path from 'path';
import { createFsFromVolume, Volume } from 'memfs';
import sourceMapSupport from 'source-map-support';

class NodeModule extends Module {
	static _load: (request: string, parent: Module) => any;

	_compile: (moduleString: string, path: string) => void;
}

export const mfs = createFsFromVolume(new Volume());

// @ts-expect-error To support Webpack 4. No longer needed in WP5
mfs.join = path.join;

sourceMapSupport.install({
	environment: 'node',
	retrieveFile(filePath: string) {
		if (mfs.existsSync(filePath)) {
			return mfs.readFileSync(filePath).toString();
		}
	},
});

export const mRequire = (modulePath: string): any => {
	const virtualModule = new Module(modulePath, module);
	const moduleSource = mfs.readFileSync(modulePath).toString();

	(virtualModule as NodeModule)._compile(moduleSource, modulePath);

	return virtualModule.exports;
};

const memWebpackEntry = '/main.js';
function hasMemFsInCallStack(parentModule) {
	while (parentModule.id !== memWebpackEntry && parentModule.parent) {
		parentModule = parentModule.parent;
	}
	return parentModule.id === memWebpackEntry;
}

const isFilePath = /^[./]/;

// Patch to support require() calls within test chunks (eg. dynamic-imports)
const { _load } = Module as typeof NodeModule;
(Module as typeof NodeModule)._load = function _memoryLoad(request, parent) {
	if (hasMemFsInCallStack(parent)) {
		// Resolve relative memfs path
		if (isFilePath.test(request)) {
			return mRequire(path.resolve(parent.path, request));
		}

		// Resolve node module
		return Reflect.apply(_load, this, [request, module]);
	}

	// eslint-disable-next-line prefer-rest-params
	return Reflect.apply(_load, this, arguments);
};
