export type InstantMochaOptions = Mocha.MochaOptions & {
	webpackConfig: string;
	watch: boolean;
	spec: string[];
};
