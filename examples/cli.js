#!/usr/bin/env node
'use strict';
const http = require('http');
const zield = require('../dist');
const randomInt = (min = 1000, max = 5000) => Math.floor(Math.random() * (max + 1 - min) + min);
const fakeProcess = name => {
	return (proc, next) => {
		proc.log('start: %s', name);
		setTimeout(() => {
			if (randomInt(0, 10) % 2 === 0) {
				proc.log('end: %s', name);
			} else {
				proc.fatal(new Error(name));
			}
			next();
		}, randomInt());
	};
}

zield.setup(p => {
	p.flags('--env').as('-e').string('development').describe('Set the environment [NODE_ENV] value');
	p.flags('--verbose').as('-V').describe('Verbose the output console');
	p.flags('--production').as('-p', '-T').describe('Set NODE_ENV to production');
});

zield.task('example', 'Example process', p => {
	p.use(fakeProcess('process - 1'));
	p.use(fakeProcess('process - 2'));
	p.use(fakeProcess('process - 3'), fakeProcess('process - 4'));
	p.run((proc, next) => {
		proc.log('process done');
	});
});

zield.task('start:serve', 'Running server', p => {
	p.flags('--port').number(3000).describe('Set the server port');
	p.use(fakeProcess('process - 1'));
	p.use((proc, next) => {
		proc.log('[start] running server');
		const PORT = proc.get('--port');
		http.createServer((request, response) => {
			response.writeHead(200, {'content-type': 'text/plain'});
			response.end('🍕');
		}).listen(PORT, () => next());
	});
	p.use(fakeProcess('process - 3'));
	p.run((proc) => {
		proc.log('[finish] server running on localhost:%s', proc.get('--port'));
	});
});

zield.task('build', 'Build package', p => {
	p.argv('[package-name]').describe('Set the package name to build');
	p.flags('--out-dir').as('-D').describe('Change the output directory to build').string('dist');
	p.flags('--config').as('-c').describe('The config path').string('vevo.config.js');
	p.flags('--project').as('-p').describe('Set the project path').string('packages');
	p.use((proc, next) => {
		proc.log('Starting cleanup');
		next();
	});
	p.use((proc, next) => {
		proc.log('argv: %O', proc.argv);
		proc.log('--out-dir: %s', proc.get('--out-dir'));
		next();
	});
	p.run(fakeProcess('babel'), (proc, next) => {
		proc.log('build done');
	});
});
