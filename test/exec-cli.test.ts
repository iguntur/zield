import path from 'path';
import cp from 'child_process';
import test, {CbMacro} from 'ava';
import {testPath, multiline} from './helpers';

interface Options {
	cwd: string;
	argv: string[];
	expected: {
		stdout?: string;
		stderr?: string;
	};
}

const stdout: CbMacro<[Options]> = (t, opts) => {
	const tsnode = path.resolve(process.cwd(), 'node_modules/.bin/ts-node');
	const ps = cp.spawn(tsnode, opts.argv, {
		cwd: testPath(opts.cwd),
		stdio: ['ignore', 'pipe', process.stderr],
	});

	let output = '';
	ps.stdout.on('data', data => {
		output += data;
	});

	ps.on('exit', code => {
		t.is(output.trimRight(), opts.expected.stdout);
		t.is(code, 0);
		t.end();
	});
};

const stderr: CbMacro<[Options]> = (t, opts) => {
	const tsnode = path.resolve(process.cwd(), 'node_modules/.bin/ts-node');
	const ps = cp.spawn(tsnode, opts.argv, {
		cwd: testPath(opts.cwd),
		stdio: ['ignore', 'ignore', 'pipe']
	});

	let output = '';
	ps.stderr.on('data', data => {
		output += data;
	});

	ps.on('exit', () => {
		t.is(output.trimRight(), opts.expected.stderr);
		t.end();
	});
};

test.cb('empty', stdout, {
	cwd: './fixtures/packages/empty',
	argv: ['cli'],
	expected: {
		stdout: ''
	}
});

test.cb('show help - default', stdout, {
	cwd: './fixtures/packages/foo',
	argv: ['cli'],
	expected: {
		stdout: multiline([
			'  Usage',
			'    $ program [commands] [options]',
			'',
			'  Commands',
			'    build                                   Build description',
			'',
			'  Options',
			'    --help                                  Show help messages',
			'    --version                               Show CLI version',
		])
	}
});

test.cb('show help - [--help]', stdout, {
	cwd: './fixtures/packages/awesome',
	argv: ['cli', '--help'],
	expected: {
		stdout: multiline([
			'  Usage',
			'    $ awesome [commands] [options]',
			'',
			'  Commands',
			'    node                                    Show awesome node',
			'',
			'  Options',
			'    --help                                  Show help messages',
			'    --version                               Show CLI version',
		])
	}
});

test.cb('script - show help', stdout, {
	cwd: './fixtures/packages/script',
	argv: ['cli', '--help'],
	expected: {
		stdout: multiline([
			'  Usage',
			'    $ script [commands] [options]',
			'',
			'  Commands',
			'    build                                   Build application',
			'    start                                   Start application',
			'    test:package                            Running test',
			'    install                                 Install packages',
			'',
			'  Options',
			'    --help                                  Show help messages',
			'    --version                               Show CLI version',
		])
	}
});

test.cb('script - show spesifiec command help with arguments', stdout, {
	cwd: './fixtures/packages/script',
	argv: ['cli', 'install', '--help'],
	expected: {
		stdout: multiline([
			'  Usage',
			'    $ script install [<arguments>, <options>]',
			'',
			'  Arguments',
			'    <package-name>                          The package name to install',
			'',
			'  Options',
			'    --help                                  Show help messages',
			'    --version                               Show CLI version',
			'    --verbose                               Verbose the output',
			'    --save-dev                              Install as devDependencies',
		])
	}
});

test.cb('script - show spesifiec command help - no arguments and multiple aliases', stdout, {
	cwd: './fixtures/packages/script',
	argv: ['cli', 'build', '--help'],
	expected: {
		stdout: multiline([
			'  Usage',
			'    $ script build [<options>]',
			'',
			'  Options',
			'    --help                                  Show help messages',
			'    --version                               Show CLI version',
			'    --production, -p, -R                    Build for production mode',
		])
	}
});

test.cb('script - default task', stdout, {
	cwd: './fixtures/packages/script',
	argv: ['cli'],
	expected: {
		stdout: 'default task'
	}
});

test.cb('script - build', stdout, {
	cwd: './fixtures/packages/script',
	argv: ['cli', 'build'],
	expected: {
		stdout: multiline([
			'[start] lint',
			'[end]   lint',
			'[start] cleanup',
			'[end]   cleanup',
			'[start] build',
			'[end]   build',
			'done'
		])
	}
});

test.cb('script - start', stdout, {
	cwd: './fixtures/packages/script',
	argv: ['cli', 'start'],
	expected: {
		stdout: multiline([
			'[start] cleanup',
			'[end]   cleanup',
			'running webpack watch',
			'server running on localhost:3000'
		])
	}
});

test.cb('script - test:package', stdout, {
	cwd: './fixtures/packages/script',
	argv: ['cli', 'test:package'],
	expected: {
		stdout: multiline([
			'[start] cleanup',
			'[end]   cleanup',
			'[start] test:lint',
			'[end]   test:lint',
			'[start] test:unit',
			'[end]   test:unit',
			'testing done'
		])
	}
});

test.cb('immutable task', stdout, {
	cwd: './fixtures/packages/immutable',
	argv: ['cli', 'foo'],
	expected: {
		stdout: 'foo 1'
	}
});

test.cb('immutable - show help', stdout, {
	cwd: './fixtures/packages/immutable',
	argv: ['cli', '--help'],
	expected: {
		stdout: multiline([
			'  Usage',
			'    $ woow [commands] [options]',
			'',
			'  Commands',
			'    foo                                     #1 - Foo',
			'',
			'  Options',
			'    --help                                  Show help messages',
			'    --version                               Show CLI version',
		])
	}
});

test.cb('scope - log pass', stdout, {
	cwd: './fixtures/packages/scope',
	argv: ['cli', 'scope:pass'],
	expected: {
		stdout: ' scope:pass  foo'
	}
});

test.cb('scope - log fatal', stderr, {
	cwd: './fixtures/packages/scope',
	argv: ['cli', 'scope:fail'],
	expected: {
		stderr: ' scope:fail  error'
	}
});

test.cb('show version', stdout, {
	cwd: './fixtures/packages/awesome',
	argv: ['cli', '--version'],
	expected: {
		stdout: 'v1.0.0'
	}
});
