import {MainFlagSchema} from '../types.d';
import * as store from './store';
import {UI} from './console-ui';
import * as flagify from './flagify';

const DEFAULT_TASK = store.DEFAULT_TASK;
const [flag, command, span] = UI.layout([4, 40, 0], [4, 40, 0], [2, 0]);

function createTextOptions(mainFlag: MainFlagSchema) {
	const allFlags = Object.keys(mainFlag);

	if (allFlags.length <= 0) {
		return [];
	}

	const textOptions: string[] = [];
	const helpTextOptions = ['', span.text('', 'Options')];
	const flagsOptions = allFlags.map(key => {
		const alias = mainFlag[key].alias;
		const long = mainFlag[key].long as string;
		const description = mainFlag[key].description || '';
		const longFlag = flagify.long(long);

		if (Array.isArray(alias) && alias.length > 0) {
			const aliases = alias.map(flagify.short).join(', ');
			return flag.text('', `${longFlag}, ${aliases}`, description);
		}

		return flag.text('', longFlag, description);
	});

	textOptions.push(...helpTextOptions, ...flagsOptions);

	return textOptions;
}

function createTextCommands() {
	const commandTask = store.getCommandTask();
	const tasks = Object.keys(commandTask);

	if (tasks.length <= 0) {
		return [];
	}

	const textCommands: string[] = [];
	const helpTextCommands = ['', span.text('', 'Commands')];
	const availableCommands = tasks
		.map(commandName => {
			return commandName === DEFAULT_TASK ? null : (() => {
				const description = commandTask[commandName].description || '';
				return command.text('', `${commandName}`, description);
			})();
		})
		.filter(str => typeof str === 'string') as string[];

	if (availableCommands.length > 0) {
		textCommands.push(...helpTextCommands, ...availableCommands);
	}

	return textCommands;
}

function createTextUsage(taskName: string, argv: string[] | undefined) {
	const binName = store.getState('binName');
	const textUsages = [
		span.text('', 'Usage')
	];

	if (taskName === DEFAULT_TASK) {
		const texts = ['$', binName, '[commands]', '[options]'];
		textUsages.push(span.text('', '  ' + texts.join(' ')));
	} else {
		const hasArgv = Array.isArray(argv) && argv.length > 0;
		const texts = ['$', binName, taskName];

		if (hasArgv) {
			texts.push('[<arguments>, <options>]');
		} else {
			texts.push('[<options>]');
		}

		textUsages.push(span.text('', '  ' + texts.join(' ')));
	}

	return textUsages;
}

function createTextArgv(taskName: string) {
	if (taskName === DEFAULT_TASK) {
		return;
	}

	const textArgv: string[] = [];
	const commandTask = store.getCommandTaskByName(taskName);
	const $argv = Object.keys(commandTask.argv);

	if ($argv.length > 0) {
		const helpTextArgv = ['', span.text('', 'Arguments')];

		const argvs = $argv.map(key => {
			const argvName = commandTask.argv[key].name;
			const argvDesc = commandTask.argv[key].description || '';
			return command.text('', argvName, argvDesc);
		});

		if (argvs.length > 0) {
			textArgv.push(...helpTextArgv, ...argvs);
		}
	}

	return textArgv;
}

function createTextCommandsOptions(taskName: string) {
	const $commandTaskByName = store.getCommandTaskByName(taskName);

	return createTextOptions($commandTaskByName.flags);
}

export default async function buildHelp(taskName: string) {
	const textCommands = createTextCommands();
	const textArguments = createTextArgv(taskName);
	const helpMessages = [
		...createTextUsage(taskName, textArguments)
	];

	let textOptions;

	// Show help message when no arguments (default task)
	if (taskName === DEFAULT_TASK && textCommands.length > 0) {
		textOptions = createTextOptions(store.getGlobalFlag());
		helpMessages.push(...textCommands);
	}

	if (Array.isArray(textArguments)) {
		textOptions = createTextCommandsOptions(taskName);
		helpMessages.push(...textArguments);
	}

	if (textOptions.length > 0) {
		helpMessages.push(...textOptions);
	}

	return {
		show() {
			console.log(UI.join(helpMessages));
		}
	};
}
