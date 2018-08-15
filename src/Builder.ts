import { BuildStepCompositeState, BuildStepState, NullState, State } from "./State"
import { BuildConfig, ModelBuilderBuildConfig } from "./BuildConfig"
import { dashingCallback, seed } from "./Dashing"




export interface Builder
{
	registerState( stateName: string, seed: seed, onCreated?: dashingCallback ): this
	
	applyState( ...states: Array<string> ): this
	
	times( times: number ): this
	
	make( overrides?: seed ): any
	
	reset(): void
}

export class ModelBuilder implements Builder
{
	
	private _generator: any
	private _model: Function
	private _defaultState: State
	private _states: Map<string, State> = new Map()
	
	private _buildConfig!: BuildConfig<State>
	
	
	constructor( generator: any, model: Function, seed: seed, onCreated?: dashingCallback )
	{
		this._defaultState = new BuildStepState( seed, onCreated )
		
		this._buildConfig = new ModelBuilderBuildConfig( this._defaultState )
		
		this._model = model
		
		this._generator = generator
		
		this.reset()
	}
	
	
	make( overrides: seed = _ => [] ): any
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
	
	
	registerState( stateName: string, seed: seed, onCreated?: dashingCallback ): this
	{
		this._states.set( stateName, new BuildStepState( seed, onCreated ) )
		
		return this
	}
	
	
	applyState( ...states: Array<string> )
	{
		states.forEach( stateName => {
			
			if ( !this._states.has( stateName ) )
				throw new Error( `No state registered under name ${stateName}` )
			
			// nullstate is just for ts, we make sure abov that it exists
			return this._activateStateForBuild( this._states.get( stateName ) || (new NullState()) )
		} )
		
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
}