import { Readable } from 'stream';
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

export const onData = (
	stream: Readable,
	match: string | RegExp,
) => new Promise<void>((resolve) => {
	let id = Math.floor(Math.random() * 100);
	console.log(id, 'expect', { match });
	const handler = (chunk: Buffer) => {
		console.log(id, {
			chunk: chunk.toString(),
		});

		// eslint-disable-next-line unicorn/prefer-regexp-test
		if (chunk.toString().match(match)) {
			stream.off('data', handler);
			console.log(id, 'resolved');
			resolve();
		}
	};

	stream.on('data', handler);
});
