import * as merge from "lodash.merge"
import { onCreatedCallback, seedGenerator } from "./features.spec"


export interface State
{
	makeSeed: seedGenerator
	applyOnCreated: onCreatedCallback
}


class NullState implements State
{
	applyOnCreated = ( instance, generator ) => undefined
	
	makeSeed = ( generator ) => []
}

export class BuildStepState implements State
{
	
	private _seed: seedGenerator
	private _onCreated: onCreatedCallback
	
	
	constructor( seed: seedGenerator, onCreated?: onCreatedCallback )
	{
		this._seed = seed
		this._onCreated = onCreated || (() => undefined)
	}
	
	
	makeSeed = ( generator ) => this._seed( generator )
	
	
	applyOnCreated = ( instance, generator ) => this._onCreated( instance, generator )
	
}

export class BuildStepCompositeState implements State
{
	private _states: Array<State> = []
	
	
	constructor( ...states: Array<State> )
	{
		this._states = states || new NullState()
	}
	
	
	applyOnCreated = ( instance, generator ) =>
		this._states
			.reduce(
				( _instance, state ) =>
					state.applyOnCreated( _instance, generator ) || _instance,
				instance,
			)
	
	
	makeSeed = ( generator ) =>
		this._states
			.reduce(
				( seed, state ) =>
					merge( seed, state.makeSeed( generator ) ),
				[],
			)
}

