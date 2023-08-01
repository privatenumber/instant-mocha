import path from 'path';
import { createFsFromVolume, Volume } from 'memfs';
import { createFsRequire } from 'fs-require';
import sourceMapSupport from '@cspotcode/source-map-support';

export const mfs = createFsFromVolume(new Volume());

// @ts-expect-error To support Webpack 4. No longer needed in WP5
mfs.join = path.join;

let id: number;

export const mRequire = (modulePath: string): any => {
	const require = createFsRequire(mfs, {
		fs: true,
	});

	id = require.id;

	return require(modulePath);
};

sourceMapSupport.install({
	environment: 'node',
	retrieveFile(filePath: string) {
		const fsRequirePrefix = `fs-require://${id}/`;

		if (filePath.startsWith(fsRequirePrefix)) {
			filePath = filePath.slice(fsRequirePrefix.length - 1);
		}

		if (mfs.existsSync(filePath)) {
			return mfs.readFileSync(filePath).toString();
		}
	},
});
