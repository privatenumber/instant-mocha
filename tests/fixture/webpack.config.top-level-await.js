const path = require('path');

/** @type {import('webpack').Configuration} */
const baseConfig = {
	mode: 'production',
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'src/'),
		},
	},
	experiments: {
		topLevelAwait: true,
	},
};

module.exports = baseConfig;
