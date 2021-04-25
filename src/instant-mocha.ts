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
	const webpackCompiler = createWebpackCompiler(webpackConfig, testFiles);

	if (options.watch) {
		webpackCompiler.watch({}, async (error, stats) => {
			process.stdout.write(ansiEscapes.clearTerminal);

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

			await runMocha(options);
		});
	} else {
		await webpackCompiler.$run();
		return await runMocha(options);
	}
}
