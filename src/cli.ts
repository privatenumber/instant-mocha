import run from 'mocha/lib/cli/run.js';
import { loadOptions } from 'mocha/lib/cli/options.js';
import yargs from 'yargs/yargs';
import instantMocha from './instant-mocha';
import { InstantMochaOptions } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

const INSTANT_MOCHA_OPTIONS_GROUP = 'instant-mocha options';

const argv = loadOptions(process.argv.slice(2));

yargs()
	.scriptName('instant-mocha')
	.command({
		...run,
		command: ['$0 [spec..]'],
		describe: 'Build tests with Webpack and run them with Mocha',
		builder(cli) {
			const removeOptions = new Set([
				'watch',
				'watch-files',
				'watch-ignore',
			]);
			const proxiedCli = Object.assign(Object.create(cli), {
				options(mochaOptions) {
					const filteredOptions = {};
					for (const key in mochaOptions) {
						if (!removeOptions.has(key)) {
							filteredOptions[key] = mochaOptions[key];
						}
					}
					return cli.options.call(this, filteredOptions);
				},
			});
			run.builder(proxiedCli);
		},
		async handler(options) {
			try {
				const failures = await instantMocha(options as unknown as InstantMochaOptions);
				if (failures > 0) {
					// Mocha originally exists with the number of failures
					// but that's non-standard: https://github.com/mochajs/mocha/issues/3559
					process.exit(1);
				}
			} catch (error) {
				console.log(error.message);
				process.exit(1);
			}
		},
	})
	.options({
		'webpack-config': {
			description: 'Path to Webpack configuration',
			group: INSTANT_MOCHA_OPTIONS_GROUP,
			type: 'string',
		},
		watch: {
			description: 'Watch mode',
			group: INSTANT_MOCHA_OPTIONS_GROUP,
		},
		mode: {
			description: 'Mode passed to webpack development|production',
			group: INSTANT_MOCHA_OPTIONS_GROUP,
			type: 'string',
		},
	})
	.alias('m', 'mode')
	.help('help', 'Show usage information & exit')
	.alias('help', 'h')
	.version('version', 'Show version number & exit', version)
	.alias('version', 'V')
	.wrap(process.stdout.columns ? Math.min(process.stdout.columns, 80) : 80)
	.config(argv)
	.parse(argv._);
