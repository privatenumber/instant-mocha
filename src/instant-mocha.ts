import path from 'path';
import fs from 'fs';
import assert from 'assert';
import webpack from 'webpack';
import collectFiles from 'mocha/lib/cli/collect-files.js';
import AggregateError from 'aggregate-error';
import ansiEscapes from 'ansi-escapes';
import { InstantMochaOptions, WebpackEnvironmentOptions, WebpackArgvOptions } from './types';
import { runMocha } from './lib/mocha';
import { createWebpackCompiler } from './lib/webpack';

async function getWebpackConfig(
	webpackConfigPath: string,
	options: InstantMochaOptions,
): Promise<webpack.Configuration> {
	assert(
		fs.existsSync(webpackConfigPath),
		`Invalid Webpack configuration path: ${webpackConfigPath}`,
	);

	let config;
	try {
		// eslint-disable-next-line node/global-require
		config = require(webpackConfigPath);
	} catch (error) {
		if (error.code === 'ERR_REQUIRE_ESM') {
			// Using webpacks new function approach to avoid typescript
			// from transpiling dynamic import to require which breaks
			// the purpose of this since require can only load cjs files
			// and not esm modules
			// See issue https://github.com/microsoft/TypeScript/issues/43329
			// eslint-disable-next-line no-new-func
			const dynamicImport = new Function('id', 'return import(id);');
			config = (await dynamicImport(webpackConfigPath)).default;
		} else {
			throw new Error(`Faild to load Webpack configuration: ${webpackConfigPath}`);
		}
	}

	if (typeof config === 'function') {
		const environment = {} as WebpackEnvironmentOptions;
		if (options.watch) {
			environment.WEBPACK_WATCH = true;
		} else {
			environment.WEBPACK_BUILD = true;
		}

		const argv = {
			env: environment,
		} as WebpackArgvOptions;

		if (options.mode) {
			argv.mode = options.mode;
		}

		if (options.watch) {
			argv.watch = options.watch;
		}

		return config(environment, argv);
	}

	if (options.mode) {
		config.mode = options.mode;
	}

	return config;
}

export default async function instantMocha(
	options: InstantMochaOptions,
): Promise<number> {
	assert(
		options.webpackConfig,
		'Webpack configuration path must be passed in',
	);

	const webpackConfigPath = path.resolve(options.webpackConfig);
	const webpackConfig = await getWebpackConfig(webpackConfigPath, options);

	const testFiles = collectFiles({
		ignore: [],
		file: [],
		...options,
	});

	if (options.watch) {
		if (!webpackConfig.plugins) {
			webpackConfig.plugins = [];
		}

		webpackConfig.plugins.unshift({
			apply(compiler) {
				compiler.hooks.watchRun.tap('InstantMocha', () => {
					process.stdout.write(ansiEscapes.clearTerminal);
				});
			},
		});
	}

	const webpackCompiler = createWebpackCompiler(webpackConfig, testFiles);

	if (options.watch) {
		webpackCompiler.watch({}, (error, stats) => {
			if (error) {
				console.log(error);
				return;
			}

			if (stats.hasErrors()) {
				console.log(new AggregateError(stats.compilation.errors));
				return;
			}

			if (stats.hasWarnings()) {
				for (const warning of stats.compilation.warnings) {
					console.log(warning);
				}
			}

			/**
			 * Had issues with Webpackbar and a multi-page test report.
			 * It wasn't possible to clear the previous report output
			 * because it seemed like Webpackbar was storing it and
			 * re-printing.
			 *
			 * Running mocha detached from this stack seems to escape
			 * the stdout caching.
			 */
			setImmediate(() => {
				runMocha(options);
			});
		});
	} else {
		await webpackCompiler.$run();
		return await runMocha(options);
	}
}
