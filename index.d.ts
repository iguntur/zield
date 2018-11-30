export type HandlerFunction = ((proc: ProcessInterface, next: Function) => void);
export type SetupFunction = ((p: SetupCommandInterface) => void);
export type TaskFunction = ((p: TaskCommandInterface) => void);

export interface ArgvInterface {
	describe(input?: string): this;
}

export interface FlagInterface {
	as(...input: string[]): this;
	describe(input: string): this;
	boolean(input?: boolean): this;
	string(input?: string): this;
	number(input?: number): this;
}

export interface ProcessStateInterface {
	command: string;
	schema: object;
}

export interface ProcessInterface {
	state: ProcessStateInterface;
	'--': string[];
	argv: string[];
	flag: {
		[key: string]: any;
	};
	stdout: NodeJS.WritableStream;
	stderr: NodeJS.WritableStream;
	log(input: string, ...inputs: any[]): void;
	fatal(input: string | Buffer | Error, ...inputs: any[]): void;
	get(search?: string | string[]): any | any[];
}

export interface TaskCommandInterface {
	flags(input: string): FlagInterface;
	argv(input: string): ArgvInterface;
	use(...handler: HandlerFunction[]): void;
	run(...handler: HandlerFunction[]): void;
}

export interface SetupCommandInterface {
	flags(input: string): FlagInterface;
}

export interface ZieldInterface {
	setup(fn: SetupFunction): void;
	task(fn: TaskFunction): void;
	task(name: string, fn: TaskFunction): void;
	task(name: string, description: string, fn: TaskFunction): void;
}

export class Zield implements ZieldInterface {
	constructor(argv?: typeof process.argv);
	setup(fn: (p: SetupCommandInterface) => void): void;
	task(fn: TaskFunction): void;
	task(name: string, fn: TaskFunction): void;
	task(name: string, description: string, fn: TaskFunction): void;
}

declare const zield: ZieldInterface;
export default zield;
