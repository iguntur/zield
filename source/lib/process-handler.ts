import {ProcessInterface, ProcessStateInterface} from '../../index.d';
import {ParseContextArgvInterface} from '../types.d';
import os from 'os';
import util from 'util';
import chalk from 'chalk';
import stream from 'stream';
import semver from 'semver';
import {DEFAULT_TASK} from './store';

type processState = ParseContextArgvInterface & ProcessStateInterface;

export const isNativeError = error => semver.lt(process.versions.node, '10.0.0')
	? error instanceof Error
	: util.types.isNativeError(error);

const status = {
	pass(title: string) {
		return chalk.bold.white.bgBlack(` ${title} `);
	},
	fail(title: string) {
		return chalk.bold.white.bgMagenta(` ${title} `);
	}
};

function makeBuffer(input, ...rest) {
	let buffer;

	if (Buffer.isBuffer(input)) {
		buffer = input;
	} else if (isNativeError(input)) {
		buffer = Buffer.from(util.inspect(input));
	} else {
		buffer = semver.lt(process.versions.node, '10.0.0')
			? util.format(input, ...rest)
			: util.formatWithOptions({colors: true}, input, ...rest);

		buffer = Buffer.from(buffer);
	}

	return buffer;
}

function transformLine(ws: NodeJS.WritableStream, chunk, command, scope) {
	chunk.toString().split(os.EOL)
		.filter(str => str !== '')
		.forEach(str => {
			if (command !== DEFAULT_TASK) {
				ws.write(scope);
				ws.write(' ');
			}
			ws.write(makeBuffer(str));
			ws.write(os.EOL);
		});
}

function writeLineStream(processStream: NodeJS.WritableStream, command, scope) {
	return new stream.Writable({
		write(chunk, _, callback) {
			transformLine(processStream, chunk, command, scope);
			callback();
		}
	});
}

class ProcessHandler implements ProcessInterface {
	public state: ProcessStateInterface;
	public ['--']: string[];
	public argv: string[];
	public flag: {
		[key: string]: any;
	};

	constructor(state: processState) {
		const {'--': passthrough, argv, flags, ...rest} = state;
		this['--'] = passthrough;
		this.argv = argv;
		this.flag = flags;
		this.state = rest;
	}

	get stdout() {
		const command = this.state.command;
		const scope = status.pass(command);
		return writeLineStream(process.stdout, command, scope);
	}

	get stderr() {
		const command = this.state.command;
		const scope = status.fail(command);
		return writeLineStream(process.stderr, command, scope);
	}

	get = (search: string | string[] = '') => {
		if (typeof search === 'string') {
			return this.flag[search];
		}

		return ([] as string[]).concat(search).map(this.get);
	};

	fatal = (error: string | Buffer | Error, ...errors) => {
		const buffer = makeBuffer(error, ...errors);
		this.stderr.write(buffer);
	};

	log = (input: string, ...inputs) => {
		const buffer = makeBuffer(input, ...inputs);
		this.stdout.write(buffer);
	};
}

export default function processHandler(state: processState): ProcessInterface {
	return new ProcessHandler(state);
}
