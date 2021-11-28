import assert from 'assert';
import fs from 'fs';
import { pathToFileURL } from 'url';
import webpack from 'webpack';
import { InstantMochaOptions, WebpackEnvironmentOptions, WebpackArgvOptions } from '../types';

/**
 * From: https://github.com/webpack/webpack-cli/blob/0fa244b0/packages/webpack-cli/lib/utils/dynamic-import-loader.js
 *
 * We can't directly call "import" because TypeScript compiles it
 * https://github.com/microsoft/TypeScript/issues/43329
 */
function importESM(specifier: string) {
	// eslint-disable-next-line no-new-func
	const indirectImport = new Function('id', 'return import(id);');
	return indirectImport(specifier);
}

async function loadWebpackConfig(webpackConfigPath: string) {
	try {
		// eslint-disable-next-line node/global-require
		return require(webpackConfigPath);
	} catch (error) {
		// This error code is only available on versions of Node.js supporting ESM
		if (error.code === 'ERR_REQUIRE_ESM') {
			if (process.platform === 'win32') {
				webpackConfigPath = pathToFileURL(webpackConfigPath).href;
			}

			const { default: webpackConfig } = await importESM(webpackConfigPath);
			return webpackConfig;
		}

		throw new Error(`Faild to load Webpack configuration: ${webpackConfigPath}`);
	}
}

export async function getWebpackConfig(
	webpackConfigPath: string,
	options: InstantMochaOptions,
): Promise<webpack.Configuration> {
	assert(
		fs.existsSync(webpackConfigPath),
		`Invalid Webpack configuration path: ${webpackConfigPath}`,
	);

	const config = await loadWebpackConfig(webpackConfigPath);

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
