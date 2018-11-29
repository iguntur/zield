import test, {Macro} from 'ava';
import * as m from '../source/lib/flagify';

const long: Macro<[string, string]> = (t, input, expected) => {
	t.is(m.long(input), expected);
};

long.title = (title = '[long]', input, expected) => `${title} "${input}" = "${expected}"`.trim();

const short: Macro<[string, string]> = (t, input, expected) => {
	t.is(m.short(input), expected);
};

short.title = (title = '[short]', input, expected) => `${title} "${input}" = "${expected}"`.trim();

test(long, '--foo', '--foo');
test(long, '--foo-bar', '--foo-bar');
test(long, 'foo', '--foo');
test(long, 'foo bar', '--foo-bar');
test(long, 'foo-bar', '--foo-bar');
test(long, 'foo-Bar', '--foo-bar');
test(long, 'foo-bar--', '--foo-bar');
test(long, 'foo ', '--foo');
test(long, ' foo ', '--foo');

test(short, '-f', '-f');
test(short, '-V', '-V');
test(short, '--V', '-V');
test(short, '-f-', '-f');
test(short, '-fv-', '-fv');
test(short, 'a', '-a');
test(short, '  a  ', '-a');
test(short, 'aB', '-aB');
