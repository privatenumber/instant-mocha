import fs from 'fs';
import path from 'path';
import { testSuite, expect } from 'manten';
import { createFixture } from 'fs-fixture';
import {
	instantMocha,
	fixturePath,
	onData,
} from '../utils.mjs'; // eslint-disable-line import/extensions

type AliasMap = Record<string, string>;

const webpackVersions: [string, AliasMap][] = [
	['Webpack 5', {}],
	['Webpack 4', { webpack: 'webpack4' }],
];

const mochaVersions: [string, AliasMap][] = [
	['Mocha 10', {}],
	['Mocha 9', { mocha: 'mocha9' }],
	['Mocha 8', { mocha: 'mocha8' }],
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

		for (const [webpackLabel, webpackVersion] of webpackVersions) {
			for (const [mochaLabel, mochaVersion] of mochaVersions) {
				describe(`${webpackLabel} + ${mochaLabel}`, ({ test }) => {
					const ALIASES = JSON.stringify({
						...webpackVersion,
						...mochaVersion,
					});

					test('running tests', async () => {
						const { exitCode, stdout } = await instantMocha(
							[
								'--webpackConfig',
								'webpack.config.js',
								'tests/passing-test.js',
							],
							{
								env: { ALIASES },
							},
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
							{
								env: { ALIASES },
							},
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
							{
								env: { ALIASES },
							},
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
							{
								env: { ALIASES },
							},
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
							{
								env: { ALIASES },
							},
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
							{
								env: { ALIASES },
							},
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
							{
								env: { ALIASES },
							},
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
								env: { ALIASES },
								cwd: fixture.path,
							},
						);

						onTestFail(() => {
							console.log(instantMochaWatch);

							// eslint-disable-next-line unicorn/no-process-exit
							process.exit();
						});

						const passingTestPath = path.join(fixture.path, './tests/passing-test.js');
						const passingTestSource = await fs.promises.readFile(passingTestPath, 'utf8');

						await onData(instantMochaWatch.stdout, '3 passing');

						await new Promise((resolve) => {
							setTimeout(resolve, 1000);
						});

						fs.promises.writeFile(passingTestPath, passingTestSource.replace('=== 3', '=== 4'));
						await onData(instantMochaWatch.stdout, '2 passing');

						fs.promises.writeFile(passingTestPath, passingTestSource);
						await onData(instantMochaWatch.stdout, '3 passing');

						instantMochaWatch.kill();
						await instantMochaWatch;

						await fixture.rm();
					});
				});
			}
		}
	});
});
