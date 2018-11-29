import {FlagInterface} from '../index.d';

export interface IMainAttribute {
	name?: string;
	description?: string;
}

export type TTypeOfFlagAttribute = 'string' | 'number' | 'boolean';
export type TValueOfFlagAttribute = string | number | boolean | null;
export interface FlagAttributeState {
	long?: string;
	alias?: string[];
	description?: string;
	default?: TValueOfFlagAttribute;
	type: TTypeOfFlagAttribute;
	[key: string]: any;
}

export interface MainArgv {
	[argvName: string]: IMainAttribute;
}

export interface MainFlagSchema {
	[flagName: string]: FlagAttributeState;
}

export interface MainCommands {
	[commandName: string]: ICommandAttribute;
}

export interface ICommandAttribute extends IMainAttribute {
	flags: MainFlagSchema;
	argv: MainArgv;
}

export interface MainProgram {
	flags?: MainFlagSchema;
	commands?: MainCommands;
}

export interface IContextFlagSchema {
	_: string[];
	'--': string[];
	[key: string]: any;
}

export interface ParseContextArgvInterface {
	'--': string[];
	argv: string[];
	flags: {
		[key: string]: any;
	};
}

export interface IYargsOptions {
	string: string[];
	boolean: string[];
	number: string[];
	alias: {
		[key: string]: string;
	};
	default: {
		[key: string]: any;
	};
}
