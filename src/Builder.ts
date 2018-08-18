import { CompositeModelPreset, ModelPreset, NullPreset, Preset } from "./Preset"
import { BuildConfig, ModelBuilderBuildConfig } from "./BuildConfig"
import { dashingCallback, modelParameters } from "./Dashing"




export interface Builder
{
	registerPreset( stateName: string, seed: modelParameters, onCreated?: dashingCallback ): this
	
	preset( ...states: Array<string> ): this
	
	times( times: number ): this
	
	make( overrides?: modelParameters ): any
	
	reset(): void
}

export class ModelBuilder implements Builder
{
	
	private _generator: any
	private _model: Function
	private _defaultState: Preset
	private _states: Map<string, Preset> = new Map()
	
	private _buildConfig!: BuildConfig<Preset>
	
	
	constructor( generator: any, model: Function, seed: modelParameters, onCreated?: dashingCallback )
	{
		this._defaultState = new ModelPreset( this._normalizeSeed( seed ), onCreated )
		
		this._buildConfig = new ModelBuilderBuildConfig( this._defaultState )
		
		this._model = model
		
		this._generator = generator
		
		this.reset()
	}
	
	
	make( overrides: modelParameters = _ => [] ): any
	{
		this._activateStateForBuild( new ModelPreset( this._normalizeSeed( overrides ) ) )
		
		let made: any[] = []
		
		for ( let i = 0; i < this._buildConfig.getTimes(); i++ ) {
			
			made.push( this._make() )
		}
		
		this.reset()
		
		return made.length > 1 ?
		       made :
		       made.pop()
	}
	
	
	registerPreset( stateName: string, seed: modelParameters, onCreated?: dashingCallback ): this
	{
		this._states.set( stateName, new ModelPreset( this._normalizeSeed( seed ), onCreated ) )
		
		return this
	}
	
	
	preset( ...states: Array<string> )
	{
		states.forEach( stateName => {
			
			if ( !this._states.has( stateName ) )
				throw new Error( `No state registered under name ${stateName}` )
			
			// nullstate is just for ts, we make sure abov that it exists
			return this._activateStateForBuild( this._states.get( stateName ) || (new NullPreset()) )
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
		const preset = new CompositeModelPreset( ...this._buildConfig.getSteps() )
		
		let instance = new (this._model as any)( ...preset.makeSeed( this._generator ) )
		
		return preset.applyOnCreated( instance, this._generator )
	}
	
	
	private _activateStateForBuild( state: Preset ): void
	{
		this._buildConfig.addStep( state )
	}
	
	
	private _normalizeSeed( seed: any ): modelParameters
	{
		return typeof seed !== "function" ?
		       g => seed :
		       seed
	}
}