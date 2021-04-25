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

			// Same as target: 'node' for async loading chunks
			chunkLoading: 'require',
			chunkFormat: 'commonjs',
		},
	};

	// Externalize Node built-in modules
	if (webpack.version && webpack.version[0] > '4') {
		if (!config.externalsPresets) {
			config.externalsPresets = {};
		}
		config.externalsPresets.node = true;
	} else {
		if (!config.externals) {
			config.externals = [];
		} else if (!Array.isArray(config.externals)) {
			config.externals = [config.externals];
		}

		config.externals.push(...Module.builtinModules);
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
