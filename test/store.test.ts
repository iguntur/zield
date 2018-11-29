import ava, {TestInterface} from 'ava';
import * as store from '../source/lib/store';
import {MainFlagSchema, MainCommands} from '../source/types';

interface Context {
	fixturesArgv: string[];
	fixturesFlag: MainFlagSchema;
	fixturesCommand: MainCommands;
}
const test = ava as TestInterface<Context>;
test.beforeEach(t => {
	process.argv = [];
	store.init({argv: process.argv, flags: {}});
	t.context = {
		fixturesArgv: ['foo', 'bar', '--baz'],
		fixturesFlag: {
			help: {
				type: 'boolean',
				alias: ['-h'],
				default: false,
				long: '--help',
			},
			version: {
				type: 'boolean',
				alias: ['-v'],
				default: false,
				long: '--version',
			}
		},
		fixturesCommand: {
			install: {
				name: 'install',
				description: 'lorem ipsum',
				argv: {},
				flags: {
					saveDev: {
						type: 'boolean',
						alias: ['-D'],
						long: '--save-dev',
					}
				},
			},
			build: {
				name: 'build',
				description: 'lorem ipsum',
				argv: {},
				flags: {
					production: {
						type: 'boolean',
						alias: ['-p'],
						long: '--production'
					}
				},
			}
		}
	};
});

test('get default process.argv', t => {
	t.deepEqual(store.getProcessArgv(), []);
});

test('set and get process.argv', t => {
	const {fixturesArgv} = t.context;
	store.setProcessArgv(fixturesArgv);
	t.deepEqual(store.getProcessArgv(), fixturesArgv);
});

test('get default global flag', t => {
	t.deepEqual(store.getGlobalFlag(), {});
});

test('set and get global flag', t => {
	const {fixturesFlag} = t.context;
	store.setGlobalFlag(fixturesFlag);
	t.deepEqual(store.getGlobalFlag(), fixturesFlag);
});

test('set and get command task', t => {
	const {fixturesCommand} = t.context;
	store.setCommandTask(fixturesCommand);
	t.deepEqual(store.getCommandTask(), fixturesCommand);
});

test('get default command task by name', t => {
	store.init({argv: process.argv, flags: {}});
	t.deepEqual(store.getCommandTaskByName('install'), {});
});

test('get command task by name', t => {
	const {fixturesCommand} = t.context;
	store.setCommandTask(fixturesCommand);
	t.deepEqual(store.getCommandTaskByName('install'), fixturesCommand.install);
});

test('get command task by name and merge with global flag', t => {
	const {fixturesFlag, fixturesCommand} = t.context;
	store.setGlobalFlag(fixturesFlag);
	store.setCommandTask(fixturesCommand);
	const expected = {...fixturesCommand.install};
	expected.flags = {...fixturesFlag, ...fixturesCommand.install.flags};

	t.deepEqual(store.getCommandTaskByName('install'), expected);
});
