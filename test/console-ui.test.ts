import os from 'os';
import test from 'ava';
import {UI} from '../source/lib/console-ui';

test('basic line - 1 line, 1 column', t => {
	const line = new UI();
	t.is(line.text('foobar'), 'foobar');
});

test('basic line - 2 line, 1 column', t => {
	const line = new UI();
	const actual = [
		line.text('foo'),
		line.text('bar')
	];

	t.deepEqual(actual, ['foo', 'bar']);
});

test('padding text - 1 line, 2 column', t => {
	const line = new UI(10, 0);
	const result = line.text('foo', 'bar');
	t.is(result, 'foo       bar');
});

test('padding text - 1 line, 3 column', t => {
	const line = new UI(10, 10, 0);
	const result = line.text('foo', 'bar', 'baz');
	t.is(result, 'foo       bar       baz');
});

test('padding text- 1 line, 3 column - trim last column', t => {
	const line = new UI(10, 10, 5);
	const result = line.text('foo', 'bar', 'baz');
	t.is(result, 'foo       bar       baz');
});

test('CLI - command style', t => {
	const th = new UI(0);
	const td = new UI(10, 20, 0);
	const result = UI.join([
		th.text('Usage'),
		th.text('  $ npm [command] <options>'),
		th.text(''),
		th.text('Commands'),
		td.text('  install', '<package-name>', 'Install description'),
		td.text('  publish', '<package-name>', 'Publish description')
	]);

	t.is(result, [
		'Usage',
		'  $ npm [command] <options>',
		'',
		'Commands',
		'  install <package-name>      Install description',
		'  publish <package-name>      Publish description'
	].join(os.EOL));
});

test('CLI - flags style', t => {
	const tr = new UI(0);
	const td = new UI(20, 50, 0);
	const result = UI.join([
		tr.text('Usage'),
		tr.text('  $ program [<arguments>, <options>]'),
		tr.text(''),
		tr.text('Options'),
		td.text('  --help, -h', 'Show help message.'),
		td.text('  --version, -v', 'Display CLI version.'),
		td.text('  --verbose, -V', 'Verbose the output console.', '[default: false]'),
		td.text('  --env', 'Set the environment [NODE_ENV] value.', '[default: "development"]')
	]);

	t.is(result, [
		'Usage',
		'  $ program [<arguments>, <options>]',
		'',
		'Options',
		'  --help, -h        Show help message.',
		'  --version, -v     Display CLI version.',
		'  --verbose, -V     Verbose the output console.                       [default: false]',
		'  --env             Set the environment [NODE_ENV] value.             [default: "development"]'
	].join(os.EOL));
});

test('.layout()', t => {
	const [flag, command, span] = UI.layout([2, 25, 40, 0], [2, 25, 0], [0]);
	const result = [
		span.text('Usage'),
		span.text('  $ program [<arguments>, <options>]'),
		span.text(''),
		span.text('Options'),
		flag.text('', '--help, -h', 'Show help message.'),
		flag.text('', '--version, -v', 'Display CLI version.'),
		flag.text('', '--verbose, -V', 'Verbose the output console.', '[default: false]'),
		flag.text('', '--env', 'Set the environment [NODE_ENV] value.', '[default: "development"]'),
		span.text(''),
		span.text('Available Commands'),
		command.text('', 'install <package-name>', 'Install description'),
		command.text('', 'publish <package-name>', 'Publish description')
	];

	t.deepEqual(result, [
		'Usage',
		'  $ program [<arguments>, <options>]',
		'',
		'Options',
		'  --help, -h               Show help message.',
		'  --version, -v            Display CLI version.',
		'  --verbose, -V            Verbose the output console.             [default: false]',
		'  --env                    Set the environment [NODE_ENV] value.   [default: "development"]',
		'',
		'Available Commands',
		'  install <package-name>   Install description',
		'  publish <package-name>   Publish description'
	]);
});
