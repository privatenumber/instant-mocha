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
		test('top level await', async () => {
			const { exitCode, stdout } = await instantMocha([
				'--webpackConfig',
				'webpack.config.top-level-await.js',
				'tests/top-level-await.js',
			]);

			expect(stdout).toMatch('2 passing');
			expect(exitCode).toBe(0);
		});

		for (const [label, nodeOptions] of nodeConfigurations) {
			describe(label, ({ test }) => {
				test('running tests', async () => {
					const { exitCode, stdout } = await instantMocha(
						[
							'--webpackConfig',
							'webpack.config.js',
							'tests/passing-test.js',
						],
						{ nodeOptions },
					);

					expect(stdout).toMatch('3 passing');
					expect(exitCode).toBe(0);
				});

				test('exit-code on failure', async () => {
					const { exitCode, stdout } = await instantMocha(
						[
							'--webpackConfig',
							'webpack.config.js',
							'tests/failing-test.js',
						],
						{ nodeOptions },
					);

					expect(stdout).toMatch('2 failing');
					expect(exitCode).toBe(1);
				});

				test('custom reporter', async () => {
					const { exitCode, stdout } = await instantMocha(
						[
							'--webpackConfig',
							'webpack.config.js',
							'--reporter',
							'custom-reporter.js',
							'tests/failing-test.js',
						],
						{ nodeOptions },
					);

					expect(stdout).toMatch('Custom failure message');
					expect(exitCode).toBe(1);
				});

				test('dynamic import', async () => {
					const { exitCode, stdout } = await instantMocha(
						[
							'--webpackConfig',
							'webpack.config.js',
							'tests/dynamic-import-test.js',
						],
						{ nodeOptions },
					);

					expect(stdout).toMatch('1 passing');
					expect(exitCode).toBe(0);
				});

				test('custom assertion library - chai', async () => {
					const { exitCode, stdout } = await instantMocha(
						[
							'--webpackConfig',
							'webpack.config.js',
							'tests/using-chai.js',
						],
						{ nodeOptions },
					);

					expect(stdout).toMatch('1 passing');
					expect(exitCode).toBe(0);
				});

				test('function config', async () => {
					const { exitCode, stdout } = await instantMocha(
						[
							'--webpackConfig',
							'webpack.config.function.js',
							'tests/passing-test.js',
						],
						{ nodeOptions },
					);

					expect(stdout).toMatch('3 passing');
					expect(exitCode).toBe(0);
				});

				test('esm config', async ({ onTestFail }) => {
					const imProcess = await instantMocha(
						[
							'--webpackConfig',
							'webpack.config.esm.mjs',
							'tests/passing-test.js',
						],
						{ nodeOptions },
					);

					onTestFail(() => {
						console.log(imProcess);
					});

					expect(imProcess.stdout).toMatch('3 passing');
					expect(imProcess.exitCode).toBe(0);
				});

				test('watch tests', async ({ onTestFail }) => {
					const fixture = await createFixture(fixturePath);

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

					const out: Buffer[] = [];
					instantMochaWatch.stdout.on('data', (data) => {
						out.push(data);
					});
					instantMochaWatch.stderr.on('data', (data) => {
						out.push(data);
					});

					const results: string[] = [];

					onTestFail(() => {
						console.log(instantMochaWatch);

						console.log(results);

						console.log({ out: Buffer.concat(out).toString() });

						// eslint-disable-next-line unicorn/no-process-exit
						process.exit();
					});

					const passingTestPath = path.join(fixture.path, './tests/passing-test.js');
					const passingTestSource = await fs.promises.readFile(passingTestPath, 'utf8');

					await onData(instantMochaWatch.stdout, '3 passing');
					results.push('1');

					fs.promises.writeFile(passingTestPath, passingTestSource.replace('=== 3', '=== 4'));
					await onData(instantMochaWatch.stdout, '2 passing');
					results.push('2');

					fs.promises.writeFile(passingTestPath, passingTestSource);
					await onData(instantMochaWatch.stdout, '3 passing');
					results.push('3');

					instantMochaWatch.kill();
					await instantMochaWatch;
					results.push('4');

					await fixture.rm();
				}, 40_000);
			});
		}
	});
});
