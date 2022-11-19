import fs from 'fs';
import path from 'path';
import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import {
	instantMocha,
	fixturePath,
	onData,
} from '../utils.mjs'; // eslint-disable-line import/extensions

const nodeConfigurations: [string, string[]][] = [
	['Webpack 5', []],
	['Webpack 4', ['-r', path.resolve('tests/use-webpack4.js')]],
];

export default testSuite(({ describe }) => {
	describe('instant-mocha', ({ test }) => {
		// test('top level await', async () => {
		// 	const { exitCode, stdout } = await instantMocha([
		// 		'--webpackConfig',
		// 		'webpack.config.top-level-await.js',
		// 		'tests/top-level-await.js',
		// 	]);

		// 	expect(stdout).toMatch('2 passing');
		// 	expect(exitCode).toBe(0);
		// });

		for (const [label, nodeOptions] of nodeConfigurations) {
			describe(label, ({ test }) => {
			// 	test('running tests', async () => {
			// 		const { exitCode, stdout } = await instantMocha(
			// 			[
			// 				'--webpackConfig',
			// 				'webpack.config.js',
			// 				'tests/passing-test.js',
			// 			],
			// 			{ nodeOptions },
			// 		);

			// 		expect(stdout).toMatch('3 passing');
			// 		expect(exitCode).toBe(0);
			// 	});

			// 	test('exit-code on failure', async () => {
			// 		const { exitCode, stdout } = await instantMocha(
			// 			[
			// 				'--webpackConfig',
			// 				'webpack.config.js',
			// 				'tests/failing-test.js',
			// 			],
			// 			{ nodeOptions },
			// 		);

			// 		expect(stdout).toMatch('2 failing');
			// 		expect(exitCode).toBe(1);
			// 	});

			// 	test('custom reporter', async () => {
			// 		const { exitCode, stdout } = await instantMocha(
			// 			[
			// 				'--webpackConfig',
			// 				'webpack.config.js',
			// 				'--reporter',
			// 				'custom-reporter.js',
			// 				'tests/failing-test.js',
			// 			],
			// 			{ nodeOptions },
			// 		);

			// 		expect(stdout).toMatch('Custom failure message');
			// 		expect(exitCode).toBe(1);
			// 	});

			// 	test('dynamic import', async () => {
			// 		const { exitCode, stdout } = await instantMocha(
			// 			[
			// 				'--webpackConfig',
			// 				'webpack.config.js',
			// 				'tests/dynamic-import-test.js',
			// 			],
			// 			{ nodeOptions },
			// 		);

			// 		expect(stdout).toMatch('1 passing');
			// 		expect(exitCode).toBe(0);
			// 	});

			// 	test('custom assertion library - chai', async () => {
			// 		const { exitCode, stdout } = await instantMocha(
			// 			[
			// 				'--webpackConfig',
			// 				'webpack.config.js',
			// 				'tests/using-chai.js',
			// 			],
			// 			{ nodeOptions },
			// 		);

			// 		expect(stdout).toMatch('1 passing');
			// 		expect(exitCode).toBe(0);
			// 	});

			// 	test('function config', async () => {
			// 		const { exitCode, stdout } = await instantMocha(
			// 			[
			// 				'--webpackConfig',
			// 				'webpack.config.function.js',
			// 				'tests/passing-test.js',
			// 			],
			// 			{ nodeOptions },
			// 		);

			// 		expect(stdout).toMatch('3 passing');
			// 		expect(exitCode).toBe(0);
			// 	});

			// 	test('esm config', async ({ onTestFail }) => {
			// 		const imProcess = await instantMocha(
			// 			[
			// 				'--webpackConfig',
			// 				'webpack.config.esm.mjs',
			// 				'tests/passing-test.js',
			// 			],
			// 			{ nodeOptions },
			// 		);

			// 		onTestFail(() => {
			// 			console.log(imProcess);
			// 		});

			// 		expect(imProcess.stdout).toMatch('3 passing');
			// 		expect(imProcess.exitCode).toBe(0);
			// 	});

				test('watch tests', async () => {
					const fixture = await createFixture(fixturePath);
					console.log({ fixturePath: fixture.path });
					const instantMochaWatch = instantMocha(
						[
							'--webpackConfig',
							'webpack.config.js',
							'tests/passing-test.js',
							'--watch',
						],
						{
							nodeOptions,
							cwd: fixture.path,
						},
					);

					const passingTestPath = path.join(fixture.path, './tests/passing-test.js');
					const passingTestSource = await fs.promises.readFile(passingTestPath, 'utf8');

					await onData(instantMochaWatch.stdout, '3 passing');

					await fs.promises.writeFile(passingTestPath, passingTestSource.replace('=== 3', '=== 4'));

					await onData(instantMochaWatch.stdout, '2 passing');

					await fs.promises.writeFile(passingTestPath, passingTestSource);

					await onData(instantMochaWatch.stdout, '3 passing');

					instantMochaWatch.cancel();

					await instantMochaWatch;
					await fixture.rm();
				}, 20_000);
			});
		}
	});
});
