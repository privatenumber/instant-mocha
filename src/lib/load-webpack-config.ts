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

export async function loadWebpackConfig(webpackConfigPath: string) {
	try {
		// eslint-disable-next-line node/global-require
		return require(webpackConfigPath);
	} catch (error) {
		// This error code is only available on versions of Node.js supporting ESM
		if (error.code === 'ERR_REQUIRE_ESM') {
			return (await importESM(webpackConfigPath)).default;
		}

		throw new Error(`Faild to load Webpack configuration: ${webpackConfigPath}`);
	}
}
