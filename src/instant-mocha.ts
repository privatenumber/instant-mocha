import path from 'path';
import assert from 'assert';
import collectFiles from 'mocha/lib/cli/collect-files.js';
import AggregateError from 'aggregate-error';
import { InstantMochaOptions } from './types';
import { runMocha } from './lib/mocha';
import { createWebpackCompiler } from './lib/webpack';
import { getWebpackConfig } from './lib/get-webpack-config';
import { clearTerminal } from './lib/clear-terminal';

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
					process.stdout.write(clearTerminal);
				});
			},
		});
	}

	const webpackCompiler = createWebpackCompiler(
		webpackConfig,
		Array.isArray(testFiles) ? testFiles : testFiles.files,
	);

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
