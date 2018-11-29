import os from 'os';
import * as Str from './str';

function buildText(states: Line) {
	const arrLines: string[] = [];
	const lineWidth = states.options.width;

	states.lines.forEach($lines => {
		const lines = $lines.map(($text, $column) => {
			const line = {text: $text, width: lineWidth[$column]};
			if (line.width || line.width > 0) {
				line.text = String.prototype.padEnd
					? line.text.padEnd(line.width)
					: Str.padEnd(line.width, line.text);
			}

			if ($column === ($lines.length - 1)) {
				line.text = line.text.trimRight();
			}

			return line.text;
		}).join('');

		arrLines.push(lines);
	});

	return arrLines.join('');
}

class Line {
	public lines: string[][];
	public options: any;
	constructor(options: number[], ...texts: string[]) {
		this.options = {...options};
		this.lines = [texts];
	}
}

export class UI {
	public options: any;

	constructor(...options: number[]) {
		this.options = {
			width: {0: 0, ...options}
		};
	}

	public static join(inputs: string[]) {
		return inputs.join(os.EOL);
	}

	public static layout(...layouts: number[][]): UI[] {
		return layouts.map(opts => new UI(...opts));
	}

	public text(...texts: string[] | any) {
		return buildText(new Line(this.options, ...texts));
	}
}
