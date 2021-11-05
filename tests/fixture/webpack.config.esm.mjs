import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('webpack').Configuration} */
const baseConfig = {
	mode: 'production',
	node: {
		__dirname: true,
	},
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'src/'),
		},
	},
};

export default baseConfig;
