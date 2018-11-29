import {MainCommandInterface, TaskFunction, SetupFunction} from '../index.d';
import os from 'os';
import path from 'path';
import readPkgUp from 'read-pkg-up';
import normalizePackage from 'normalize-package-data';
import * as store from './lib/store';
import * as commander from './lib/runner';
import SetupTask from './lib/setup-task';
import SetupCommand from './lib/setup-command';
import parseArguments from './lib/parse-arguments';

delete require.cache[__filename]; // tslint:disable-line:no-dynamic-delete

const STATE = (() => {
	const p = new SetupCommand();

	p.flags('--help').boolean(false).describe('Show help messages');
	p.flags('--version').boolean(false).describe('Show CLI version');

	return {
		// @ts-ignore
		flags: p.state,
		commands: {}
	};
})();

export class Command implements MainCommandInterface {
	constructor(argv = process.argv.slice(2)) {
		store.init({argv, flags: STATE.flags});
	}

	public setup(fn: SetupFunction) {
		// tslint:disable-next-line:strict-type-predicates
		if (typeof fn !== 'function') {
			throw new TypeError('command.setup(handler: Function)');
		}

		const command = new SetupCommand();

		fn(command);

		// @ts-ignore
		store.setGlobalFlag(command.state);
	}

	public task(name?: string | TaskFunction, description?: string | TaskFunction, fn?: TaskFunction) {
		if (typeof name === 'string' && store.taskCommandExists(name)) {
			return;
		}

		let task: SetupTask;

		if (typeof name === 'function') {
			const fnHandler = name;
			task = new SetupTask('*', '');
			fnHandler(task);
		} else if (typeof name === 'string' && typeof description === 'function') {
			const fnHandler = description;
			task = new SetupTask(name, '');
			fnHandler(task);
		} else if ((typeof name === 'string' && name.trim() !== '') && typeof description === 'string' && typeof fn === 'function') {
			task = new SetupTask(name, description);
			fn(task);
		} else {
			throw new TypeError([
				'Types:',
				'  #1: command.task(name: string, description: string, handler: Function)',
				'  #2: command.task(name: string, handler: Function)',
				'  #3: command.task(handler: Function)',
			].join(os.EOL));
		}

		// @ts-ignore
		store.setCommandTask(task.state);
	}
}

export default (() => {
	process.on('unhandledRejection', error => {
		throw error;
	});

	process.nextTick(() => {
		const emitter = commander.default;

		// @ts-ignore
		const mainModuleDir = path.dirname(process.mainModule.filename);
		const pkg = readPkgUp.sync({cwd: mainModuleDir, normalize: false}).pkg || {};

		normalizePackage(pkg);

		const binName = typeof pkg.bin === 'object' ? Object.keys(pkg.bin)[0] : null;
		process.title = binName || pkg.name;

		if (binName) {
			store.setState('binName', binName);
		} else {
			const executor = path.basename(process.argv0);
			const binFile = path.basename(process.argv[1]);
			store.setState('binName', `${executor} ${binFile}`);
		}

		const eventNames = emitter.eventNames();
		const {taskName, processArgv} = commander.getTaskRunnerFromEvent(eventNames);

		commander.tryRegisterDefaultTask(emitter);

		const commandSchema = store.getCommandTaskByName(taskName);
		const contextInput = parseArguments(processArgv, commandSchema);

		if (processArgv.includes('--help')) {
			return commander.showHelp(taskName).catch(() => {}); // tslint:disable-line:no-empty
		}

		emitter.fire(taskName, contextInput);
	});

	module.exports = new Command();
	module.exports.default = module.exports;
	module.exports.Command = Command;

	return module.exports;
})();
