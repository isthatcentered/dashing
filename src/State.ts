import * as merge from "lodash.merge"
import { onCreatedCallback, seedGenerator } from "./features.spec"




export interface Composite<T>
{
	empty: () => void
	add: ( thing: T ) => void
}

export interface State
{
	makeSeed: seedGenerator
	applyOnCreated: onCreatedCallback
}

export interface CompositeState extends State, Composite<State>
{

}

class NullState implements State
{
	applyOnCreated = ( instance, generator ) => undefined
	
	makeSeed = ( generator ) => []
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
	
	
	makeSeed = ( generator ) => this._seed( generator )
	
	
	applyOnCreated = ( instance, generator ) => this._onCreated( instance, generator )
	
}

export class InstanceCompositeState implements CompositeState
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
	
	
	add = ( state: State ) => this._states.push( state )
	
	
	empty = () => this._states = []
}

