"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const run_js_1 = __importDefault(require("mocha/lib/cli/run.js"));
const options_js_1 = require("mocha/lib/cli/options.js");
const yargs_1 = __importDefault(require("yargs/yargs"));
const instant_mocha_1 = __importDefault(require("./instant-mocha"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');
const INSTANT_MOCHA_OPTIONS_GROUP = 'instant-mocha options';
const argv = options_js_1.loadOptions(process.argv.slice(2));
yargs_1.default()
    .scriptName('instant-mocha')
    .command({
    ...run_js_1.default,
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
        run_js_1.default.builder(proxiedCli);
    },
    async handler(options) {
        try {
            const failures = await instant_mocha_1.default(options);
            if (failures > 0) {
                // Mocha originally exists with the number of failures
                // but that's non-standard: https://github.com/mochajs/mocha/issues/3559
                process.exit(1);
            }
        }
        catch (error) {
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
})
    .help('help', 'Show usage information & exit')
    .alias('help', 'h')
    .version('version', 'Show version number & exit', version)
    .alias('version', 'V')
    .wrap(process.stdout.columns ? Math.min(process.stdout.columns, 80) : 80)
    .config(argv)
    .parse(argv._);
