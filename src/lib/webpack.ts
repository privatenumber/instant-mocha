import Module from 'module';
import webpack from 'webpack';
import AggregateError from 'aggregate-error';
import { mfs } from './memfs';

export function createWebpackCompiler(
	webpackConfig: webpack.Configuration,
	testFiles: string[],
) {
	const config = {
		...webpackConfig,

		entry: testFiles,

		// Yields unexpected behavior in certain loaders
		// eg. vue-loader will build in SSR mode
		// target: 'node',

		output: {
			...webpackConfig.output,

			path: '/',

			// https://stackoverflow.com/a/64715069
			publicPath: '',

			// For Node.js env
			// https://webpack.js.org/configuration/output/#outputglobalobject
			globalObject: 'this',

			libraryTarget: 'commonjs2',
		},
	};

	if (webpack.version?.split('.')[0] > '4') {
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
	} else {
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

		// @ts-expect-error WP4 accepts functions
		config.target = function (compiler) {
			new NodeTemplatePlugin().apply(compiler);
			new ReadFileCompileWasmTemplatePlugin(config.output).apply(compiler);
			new FunctionModulePlugin(config.output).apply(compiler);
			new NodeTargetPlugin().apply(compiler);
			new LoaderTargetPlugin('node').apply(compiler);
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
