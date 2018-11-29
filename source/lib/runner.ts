import {ParseContextArgvInterface} from '../types.d';
import EventEmitter from 'events';
import * as store from './store';
import buildHelp from './build-help';

const DEFAULT_TASK = store.DEFAULT_TASK;

export class CommandRunner extends EventEmitter {
	constructor() {
		super();
		super.setMaxListeners(Infinity);
	}

	handler(name: string, listener: (context: ParseContextArgvInterface) => void) {
		const taskName = name.trim();

		if (taskName === DEFAULT_TASK) {
			super.once(DEFAULT_TASK, listener);
		}

		if (super.eventNames().includes(name)) {
			return;
		}

		super.once(taskName, listener);
	}

	fire(name: string, context?: ParseContextArgvInterface) {
		super.emit(name, context);
	}
}

export function getTaskRunnerFromEvent(eventNames: (string | symbol)[]) {
	let taskName = DEFAULT_TASK;
	let processArgv: string[] = [];

	if (eventNames.length === 0) {
		return {taskName, processArgv};
	}

	processArgv = store.getProcessArgv().filter(val => {
		if (eventNames.includes(val)) {
			taskName = val;
			return false;
		}

		return true;
	});

	store.setProcessArgv(processArgv);

	return {taskName, processArgv};
}

export async function showHelp(taskName: string, code?: number) {
	return buildHelp(taskName).then(help => {
		help.show();
		process.exit(code || 0);
	});
}

export function tryRegisterDefaultTask(runner: CommandRunner) {
	if (runner.eventNames().includes(DEFAULT_TASK)) {
		return;
	}

	runner.once(DEFAULT_TASK, () => {
		showHelp(DEFAULT_TASK).catch(() => {
			//
		});
	});
}

export default (() => new CommandRunner())();
