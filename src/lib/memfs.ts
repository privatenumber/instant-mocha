import path from 'path';
import { createFsFromVolume, Volume } from 'memfs';
import { createFsRequire } from 'fs-require';
import sourceMapSupport from 'source-map-support';

export const mfs = createFsFromVolume(new Volume());

// @ts-expect-error To support Webpack 4. No longer needed in WP5
mfs.join = path.join;

sourceMapSupport.install({
	environment: 'node',
	retrieveFile(filePath: string) {
		if (mfs.existsSync(filePath)) {
			return mfs.readFileSync(filePath).toString();
		}
	},
});

export const mRequire = (modulePath: string): any => (
	createFsRequire(mfs, {
		fs: true,
	})(modulePath)
);
