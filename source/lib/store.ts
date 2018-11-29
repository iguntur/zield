import {ICommandAttribute, MainFlagSchema, MainCommands} from '../types.d';
import deepExtend from 'deep-extend';

const store = new Map();
export const DEFAULT_TASK = '*';

type StoreTypeKeys = 'process.argv' | 'flags.global' | 'commandTask' | 'binName';

export function clearState() {
	store.clear();
}

export function init(opts: object & {argv: string[]; flags: MainFlagSchema}) {
	clearState();
	setProcessArgv(opts.argv);
	setGlobalFlag(opts.flags);
}

export function setState(key: StoreTypeKeys, value: any) {
	store.set(key, value);
}

export function getState(key: StoreTypeKeys) {
	return store.get(key);
}

export function setProcessArgv(argv?: typeof process.argv) {
	setState('process.argv', argv);
}

export function getProcessArgv(): typeof process.argv {
	return getState('process.argv') as typeof process.argv;
}

export function setGlobalFlag(...flags: MainFlagSchema[]) {
	setState('flags.global', deepExtend({}, getGlobalFlag(), ...flags));
}

export function getGlobalFlag(): MainFlagSchema {
	return getState('flags.global') as MainFlagSchema;
}

export function setCommandTask(...tasks: MainCommands[]) {
	setState('commandTask', deepExtend({}, getCommandTask(), ...tasks));
}

export function getCommandTask(): MainCommands {
	return getState('commandTask') as MainCommands;
}

export function getCommandTaskByName(name: string): ICommandAttribute {
	if (!taskCommandExists(name)) {
		return {} as ICommandAttribute;
	}

	const tasks = getCommandTask();
	const commandSchema = tasks[name];

	commandSchema.flags = deepExtend({}, getGlobalFlag(), commandSchema.flags);

	return commandSchema;
}

export function taskCommandExists(name: string): boolean {
	const tasks = getCommandTask();
	return !!tasks && Object.prototype.hasOwnProperty.call(tasks, name);
}
