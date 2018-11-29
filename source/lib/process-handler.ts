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

function readDataStream(input) {
	return new stream.Readable({
		read() {
			this.push(input);
			this.push(null);
		}
	});
}

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

function transformLineStream(opts: object & {scope?: string}) {
	return new stream.Transform({
		transform(chunk, _, done) {
			chunk.toString().split(os.EOL).filter(line => line.trim() !== '').forEach(line => {
				// Ignore default task '*'
				if (typeof opts.scope === 'string') {
					this.push(opts.scope);
					this.push(' ');
				}
				this.push(line);
				this.push(os.EOL);
			});
			done();
		}
	});
}

function createCommandStream(command, scope, chunk) {
	return readDataStream(makeBuffer(chunk)).pipe(
		transformLineStream({
			scope: command === DEFAULT_TASK ? null : scope // Ignore default task '*'
		})
	);
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
		return new stream.Writable({
			write(chunk, _, callback) {
				createCommandStream(command, scope, chunk)
					.on('error', err => callback(err))
					.on('end', () => callback())
					.pipe(process.stdout);
			}
		});
	}

	get stderr() {
		const command = this.state.command;
		const scope = status.fail(command);
		return new stream.Writable({
			write(chunk, _, callback) {
				createCommandStream(command, scope, chunk)
					.on('error', err => callback(err))
					.on('end', () => callback())
					.pipe(process.stderr);
			}
		});
	}

	get = (search: string | string[] = '') => {
		if (typeof search === 'string') {
			return this.flag[search];
		}

		return ([] as string[]).concat(search).map(this.get);
	};

	fatal = (error: string | Buffer | Error, ...errors) => {
		const buffer = makeBuffer(error, ...errors);
		readDataStream(buffer).pipe(this.stderr);
	};

	log = (input: string, ...inputs) => {
		const buffer = makeBuffer(input, ...inputs);
		readDataStream(buffer).pipe(this.stdout);
	};
}

export default function processHandler(state: processState): ProcessInterface {
	return new ProcessHandler(state);
}
