const path = require('path');

/** @type {import('webpack').Configuration} */
const baseConfig = {
	mode: 'production',
	node: {
		__dirname: true,
	},
	watchOptions: {
		aggregateTimeout: 0,
		poll: true,
	},
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'src/'),
		},
	},
};

module.exports = baseConfig;
