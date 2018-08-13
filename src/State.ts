import { merge } from "lodash"
import { onCreatedCallback, seedGenerator } from "./features.spec"




export interface State
{
	readonly seed: seedGenerator
	readonly onCreated: onCreatedCallback
}

export class InstanceState implements State
{
	
	private _seed: seedGenerator
	private _onCreated: onCreatedCallback
	
	
	constructor( seed: seedGenerator, onCreated?: onCreatedCallback )
	{
		this._seed = seed
		this._onCreated = onCreated || (() => undefined)
	}
	
	
	get seed()
	{
		return this._seed
	}
	
	
	get onCreated()
	{
		return this._onCreated
	}
}

export class CompositeState implements State
{
	private _states: Array<State> = []
	
	
	
	constructor( ...states: Array<State> )
	{
		this._states = states
	}
	
	
	get onCreated()
	{
		return ( instance, generator ) => this._states
			.map( state => state.onCreated )
			.reduce( ( acc, onCreated ) =>
				onCreated( instance, generator ) || instance, instance )
	}
	
	
	get seed()
	{
		return ( generator ) => {
			
			return this._states
				.map( state => state.seed )
				.reduce( ( acc, seed ) =>
					merge( acc, seed( generator ) ), [] )
		}
	}
	
}