import {FlagInterface} from '../../index.d';
import {FlagAttributeState, TTypeOfFlagAttribute} from '../types.d';

function setValue(state: FlagAttributeState, types: TTypeOfFlagAttribute, value) {
	state.type = types;
	state.default = value;
}

export class BuildFlagAttribute implements FlagInterface {
	protected state: FlagAttributeState;

	constructor(input: string) {
		Object.defineProperty(this, 'state', {
			value: {default: false, type: 'boolean'}
		});

		this.state.long = String(input).trim();
	}

	public as(...input: string[]): this {
		this.state.alias = Array.from(input).map(val => val.trim());
		return this;
	}

	public describe(input: string): this {
		this.state.description = String(input).trim();
		return this;
	}

	public boolean(input = false): this {
		setValue(this.state, 'boolean', input);
		return this;
	}

	public string(input?: string | string[]): this {
		setValue(this.state, 'string', input);
		return this;
	}

	public number(input?: number): this {
		setValue(this.state, 'number', input);
		return this;
	}
}
