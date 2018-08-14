import * as merge from "lodash.merge"
import { onCreatedCallback, seedGenerator } from "./features.spec"




export interface Composite<T>
{
	empty: () => void
	add: ( thing: T ) => void
}

export interface State
{
	readonly seed: seedGenerator
	readonly onCreated: onCreatedCallback
}

export interface CompositeState extends State, Composite<State>
{

}

class NullState implements State
{
	get onCreated()
	{
		return ( instance, generator ) => undefined
	}
	
	
	get seed()
	{
		return ( generator ) => []
	}
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

export class InstanceCompositeState implements CompositeState
{
	private _states: Array<State> = []
	
	
	constructor( ...states: Array<State> )
	{
		this._states = states || new NullState()
	}
	
	
	get onCreated()
	{
		return ( instance, generator ) =>
			this._states
				.map( state => state.onCreated )
				.reduce( ( mutatedInstance, onCreated ) =>
					onCreated( mutatedInstance, generator ) || mutatedInstance, instance )
	}
	
	
	get seed()
	{
		return ( generator ) =>
			this._states
				.map( state => state.seed )
				.reduce( ( acc, seed ) =>
					merge( acc, seed( generator ) ), [] )
	}
	
	
	add( state: State )
	{
		this._states.push( state )
	}
	
	
	empty()
	{
		this._states = []
	}
	
}

