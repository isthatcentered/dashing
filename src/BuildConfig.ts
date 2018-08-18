import { Preset } from "./Preset"




export interface BuildConfig<T>
{
	reset(): void
	
	addStep( step: T ): void
	
	getSteps: () => Array<T>
	
	setTimes( times: number ): void
	
	getTimes: () => number
}

export class ModelBuilderBuildConfig implements BuildConfig<Preset>
{
	
	private _default: Preset
	private _steps: Array<Preset> = []
	private _times: number = 1
	
	
	constructor( defaultState: Preset )
	{
		
		if ( !defaultState )
			throw new Error( "No default state passed" )
		
		this._default = defaultState
		
		this.reset()
	}
	
	
	reset()
	{
		this._steps = [ this._default ]
		
		this.setTimes( 1 )
	}
	
	
	addStep( step )
	{
		this._steps.push( step )
	}
	
	
	getSteps()
	{
		return this._steps
	}
	
	
	setTimes( times )
	{
		this._times = times > 0 ?
		              times :
		              1
	}
	
	
	getTimes()
	{
		return this._times
	}
}