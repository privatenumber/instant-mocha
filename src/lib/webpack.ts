import webpack from 'webpack';
import AggregateError from 'aggregate-error';
import { mfs } from './memfs';

const bareSpecifierPattern = /^[^./]/;

const safeResolve = (request: string) => {
	try {
		return require.resolve(request);
	} catch {
		return false;
	}
};

const isNodeModule = (request: string) => (
	bareSpecifierPattern.test(request)
	&& safeResolve(request)
);

export function createWebpackCompiler(
	webpackConfig: webpack.Configuration,
	testFiles: string[],
) {
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

	if (webpack.version?.split('.')[0] > '4') {
		// Externalize Node built-in modules
		if (!config.externalsPresets) {
			config.externalsPresets = {};
		}
		config.externalsPresets.node = true;

		// Externalize bare-specifiers that are resolvable by Node.js (aka node_modules)
		config.externals.push(({ request }, callback) => {
			callback(
				null,
				isNodeModule(request) ? request : undefined,
			);
		});

		// Same as target: 'node' for async loading chunks
		Object.assign(config.output, {
			chunkLoading: 'require',
			chunkFormat: 'commonjs',
		});
	} else {
		// Externalize bare-specifiers that are resolvable by Node.js (aka node_modules)
		// @ts-expect-error WP 4 has different signature
		config.externals.push((_, request, callback) => {
			callback(
				null,
				isNodeModule(request) ? request : undefined,
			);
		});

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

		const target = config.target ?? 'web';
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

	const compiler = webpack(config);

	compiler.outputFileSystem = mfs;

	function $run() {
		return new Promise<webpack.Stats>((resolve, reject) => {
			(this as webpack.Compiler).run((error, stats) => {
				if (error) {
					reject(error);
					return;
				}

				if (stats.hasErrors()) {
					reject(new AggregateError(stats.compilation.errors));
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

	type CustomWebpack = webpack.Compiler & {
		$run: typeof $run;
	}

	(compiler as CustomWebpack).$run = $run;

	return compiler as CustomWebpack;
}
