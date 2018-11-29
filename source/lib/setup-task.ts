import {TaskCommandInterface, HandlerFunction, ArgvInterface, FlagInterface} from '../../index.d';
import {MainCommands, ParseContextArgvInterface} from '../types.d';
import {BuildArgvAttribute} from './build-argv-attribute';
import processHandler from './process-handler';
import SetupCommand from './setup-command';
import runner from './runner';

const $id = Symbol('$id');
const $processInput = Symbol('$context');
const $taskHandlers = Symbol('$handlers');
const $setProcessInput = Symbol('$setContext');
const $processTask = Symbol('$processTask');

abstract class TaskRunner {
	protected [$id]: string;
	protected state: MainCommands;
	protected [$taskHandlers]: HandlerFunction[];
	protected [$processInput]: ParseContextArgvInterface;

	constructor(name: string, description: string) {
		Object.defineProperty(this, $id, {
			value: String(name).trim()
		});

		this[$taskHandlers] = [];
		this.state = {
			[name]: {
				name,
				description,
				argv: {},
				flags: {}
			}
		};
	}

	public [$setProcessInput](context: ParseContextArgvInterface) {
		this[$processInput] = context;
	}

	public [$processTask](i = 0): void {
		const handlers = this[$taskHandlers];

		if (i >= handlers.length) {
			return;
		}

		const handler = handlers[i];

		const next = () => this[$processTask](i + 1);
		const processInputContext = this[$processInput];
		const proc = processHandler({
			...processInputContext,
			command: this[$id],
			schema: this.state[this[$id]]
		});

		handler.call(this, proc, next);
	}
}

export default class SetupTask extends TaskRunner implements TaskCommandInterface {
	public flags(input: string): FlagInterface {
		const flag = new SetupCommand().flags(input);
		const flags = this.state[this[$id]].flags;

		if (!(input in flags)) {
			// @ts-ignore
			flags[flag.state.long] = flag.state;
		}

		this.state[this[$id]].flags = flags;

		return flag;
	}

	public argv(input: string): ArgvInterface {
		const argv = new BuildArgvAttribute(input);
		const args = this.state[this[$id]].argv;

		if (!(input in args)) {
			// @ts-ignore
			args[argv.state.name] = argv.state;
		}

		this.state[this[$id]].argv = args;

		return argv;
	}

	public use(...handler: HandlerFunction[]): void {
		if (arguments.length > 0) {
			this[$taskHandlers].push(...handler);
		}
	}

	public run(...handler: HandlerFunction[]): void {
		if (!handler) {
			return;
		}

		this.use(...handler);

		runner.handler(this[$id], context => {
			this[$setProcessInput](context);
			this[$processTask]();
		});
	}
}
