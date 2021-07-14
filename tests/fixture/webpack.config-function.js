const path = require('path');

function createFunction() {
	console.log(arguments);
	/** @type {import('webpack').Configuration} */
	const config = {
		mode: 'production',
		entry: './src/index.js',
		resolve: {
			alias: {
				'~': path.resolve(__dirname, 'src/'),
			},
		},
	};

	return config;
}

module.exports = createFunction;
