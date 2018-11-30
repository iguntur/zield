import m from '../../../../source';

m.task('loop:pass', p => {
	p.run(proc => {
		for (let n = 1; n <= 20; n++) {
			proc.log('log:%i', n);
		}
	});
});

m.task('loop:error', p => {
	p.flags('--max').number('15').describe('Maximum loop');
	p.run(proc => {
		for (let n = 1; n <= 20; n++) {
			proc.fatal('fatal:%i', n);
		}
	});
});
