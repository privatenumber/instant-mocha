import path from 'path';
import fs from 'fs';
import assert from 'assert';
import webpack from 'webpack';
import collectFiles from 'mocha/lib/cli/collect-files.js';
import AggregateError from 'aggregate-error';
import ansiEscapes from 'ansi-escapes';
import { InstantMochaOptions } from './types';
import { runMocha } from './lib/mocha';
import { createWebpackCompiler } from './lib/webpack';

export default async function instantMocha(
	options: InstantMochaOptions,
): Promise<number> {
	assert(
		options.webpackConfig,
		'Webpack configuration path must be passed in',
	);

	const webpackConfigPath = path.resolve(options.webpackConfig);
	assert(
		fs.existsSync(webpackConfigPath),
		`Invalid Webpack configuration path: ${webpackConfigPath}`,
	);

	let webpackConfig: webpack.Configuration;
	try {
		// eslint-disable-next-line node/global-require
		webpackConfig = require(webpackConfigPath);
	} catch {
		throw new Error(`Faild to load Webpack configuration: ${webpackConfigPath}`);
	}

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
			 * Seems Webpack's watch callback can't be async.
			 *
			 * Had issues with Webpackbar and a multi-page test report.
			 * It wasn't possible to clear the previous report output
			 * because it seemed like Webpackbar was storing it and
			 * re-printing.
			 *
			 * This method is async but it's fine.
			 */
			runMocha(options);
		});
	} else {
		await webpackCompiler.$run();
		return await runMocha(options);
	}
}
