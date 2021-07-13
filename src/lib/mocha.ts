import path from 'path';
import Mocha from 'mocha';
import Suite from 'mocha/lib/suite.js';
import { mRequire } from './memfs';

function createMochaInstance(
	mochaOptions: Mocha.MochaOptions,
) {
	const mocha = new Mocha(mochaOptions);

	function $run() {
		return new Promise<number>((resolve) => {
			this.run.call(this, resolve);
		});
	}

	type CustomMocha = Mocha & {
		$run: typeof $run;
	}

	(mocha as CustomMocha).$run = $run;

	mocha.loadFilesAsync = async function loadFilesAsync() {
		const {
			suite,
			files,
		} = this as Mocha;
		// Call with true tell mocha that we will be handling the file load outselves
		this.lazyLoadFiles(true);

		for (let file of files) {
			file = path.resolve(file);

			suite.emit(
				Suite.constants.EVENT_FILE_PRE_REQUIRE,
				global,
				file,
				this,
			);
			suite.emit(
				Suite.constants.EVENT_FILE_REQUIRE,
				await mRequire(file),
				file,
				this,
			);
			suite.emit(
				Suite.constants.EVENT_FILE_POST_REQUIRE,
				global,
				file,
				this,
			);
		}
	};

	return mocha as CustomMocha;
}

export async function runMocha(
	options: Mocha.MochaOptions,
): Promise<number> {
	const mocha = createMochaInstance(options);
	mocha.files = ['/main.js'];
	await mocha.loadFilesAsync();
	return await mocha.$run();
}
