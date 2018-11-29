import os from 'os';
import path from 'path';

export function multiline(texts: string[]) {
	return texts.join(os.EOL);
}

export function testPath(...fp: string[]) {
	return path.resolve(process.cwd(), 'test', ...fp);
}
