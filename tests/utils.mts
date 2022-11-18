import path from 'path';
import { execaNode, type NodeOptions } from 'execa';
import { bin } from '../package.json';

const instantMochaPath = path.resolve(bin);
export const fixturePath = path.resolve('tests/fixture');

const nodeOptions = (
	process.version.startsWith('v18.')
		? ['--openssl-legacy-provider']
		: []
);

export const instantMocha = (
	args: string[],
	options: NodeOptions<string> = {},
) => execaNode(
	instantMochaPath,
	args,
	{
		cwd: fixturePath,
		...options,
		reject: false,
		nodeOptions: [
			...nodeOptions,
			...options.nodeOptions ?? [],
		],
	},
);

export const collectStdout = (buffers: Buffer[]) => new Promise<string>(
	(resolve) => {
		buffers.push = function (...arguments_) {
			const returnValue = Array.prototype.push.apply(buffers, arguments_);
			const stdout = Buffer.concat(buffers).toString().trim();
			if (/passing|failing/.test(stdout)) {
				buffers.splice(0);
				resolve(stdout);
			}

			return returnValue;
		};
	},
);
