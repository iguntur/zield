import {ArgvInterface} from '../../index.d';
import {IMainAttribute} from '../types.d';

export class BuildArgvAttribute implements ArgvInterface {
	protected state: IMainAttribute;

	constructor(input: string) {
		this.state = {
			name: String(input).trim()
		};
	}

	public describe(input?: string): this {
		this.state.description = String(input).trim();
		return this;
	}
}
