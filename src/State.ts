// @ts-ignore
import * as merge from "lodash.merge"
import { dashingCallback, seed } from "./Dashing"




export interface State
{
	makeSeed: seed
	applyOnCreated: dashingCallback
}


class NullState implements State
{
	applyOnCreated = ( instance, generator ) => undefined
	
	makeSeed = ( generator ) => []
}

export class BuildStepState implements State
{
	
	private _seed: seed
	private _onCreated: dashingCallback
	
	
	constructor( seed: seed, onCreated?: dashingCallback )
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

