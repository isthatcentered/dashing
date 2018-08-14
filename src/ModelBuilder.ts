import { BuildStepCompositeState, BuildStepState, State } from "./State"
import { BuildConfig, BuilderBuildConfig } from "./BuildConfig"
import { seedFactory } from "./Dashing"
import { onCreatedCallback } from "./Dashing"




export interface Builder
{
	registerState( stateName: string, seed: seedFactory, onCreated?: onCreatedCallback ): this
	
	applyState( ...states: Array<string> ): this
	
	times( times: number ): this
	
	make( overrides?: seedFactory ): any
	
	reset(): void
}

export class ModelBuilder implements Builder
{
	
	private _generator: any
	private _model: Function
	private _defaultState: State
	private _registeredStates: { [ name: string ]: State } = {}
	
	private _buildConfig!: BuildConfig<State>
	
	
	constructor( generator: any, model: Function, seed: seedFactory, onCreated?: onCreatedCallback )
	{
		this._defaultState = new BuildStepState( seed, onCreated )
		
		this._buildConfig = new BuilderBuildConfig( this._defaultState )
		
		this._model = model
		
		this._generator = generator
		
		this.reset()
	}
	
	
	make( overrides: seedFactory = _ => [] ): any
	{
		this._activateStateForBuild( new BuildStepState( overrides ) )
		
		let made: any[] = []
		
		for ( let i = 0; i < this._buildConfig.getTimes(); i++ ) {
			
			made.push( this._make() )
		}
		
		this.reset()
		
		return made.length > 1 ?
		       made :
		       made.pop()
	}
	
	
	registerState( stateName: string, seed: seedFactory, onCreated?: onCreatedCallback ): this
	{
		this._registeredStates[ stateName ] = new BuildStepState( seed, onCreated )
		
		return this
	}
	
	
	applyState( ...states: Array<string> )
	{
		states.forEach( stateName =>
			this._activateStateForBuild( this._getState( stateName ) ) )
		
		return this
	}
	
	
	reset()
	{
		this._buildConfig.reset()
	}
	
	
	times( times: number ): this
	{
		this._buildConfig.setTimes( times )
		
		return this
	}
	
	
	private _make()
	{
		const state = new BuildStepCompositeState( ...this._buildConfig.getSteps() )
		
		let instance = new (this._model as any)( ...state.makeSeed( this._generator ) )
		
		return state.applyOnCreated( instance, this._generator )
	}
	
	
	private _activateStateForBuild( state: State ): void
	{
		this._buildConfig.addStep( state )
	}
	
	
	private _getState( stateName: string )
	{
		const state = this._registeredStates[ stateName ]
		
		if ( !state )
			throw new Error( `No state registered under name ${stateName}` )
		
		return state
	}
}