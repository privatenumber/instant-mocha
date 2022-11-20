const path = require('path');

/** @type {import('webpack').Configuration} */
const baseConfig = {
	mode: 'production',
	node: {
		__dirname: true,
	},
	watchOptions: {
		aggregateTimeout: 1,
		poll: 1000,
	},
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'src/'),
		},
	},
};

module.exports = baseConfig;
