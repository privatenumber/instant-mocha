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

	if (webpack.version && webpack.version[0] > '4') {
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
		 * This externalizes Node built-in modules
		 * https://github.com/webpack/webpack/blob/v4.0.0/lib/node/NodeTargetPlugin.js
		 *
		 * And also makes chunks load as CommonJS.
		 *
		 * Setting target = 'node' may have implications outside of Webpack (eg. vue-loader)
		 * so is avoided with WP5 where it's possible to configure chunk formats
		 */
		config.target = 'node';
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
