export type InstantMochaOptions = Mocha.MochaOptions & {
	webpackConfig: string;
	watch: boolean;
	spec: string[];
	mode: string;
};
export type WebpackEnvironmentOptions = {
	WEBPACK_WATCH: boolean;
	WEBPACK_BUILD: boolean;
};
export type WebpackArgvOptions = {
	mode: string;
	watch: boolean;
	env: WebpackEnvironmentOptions;
}
