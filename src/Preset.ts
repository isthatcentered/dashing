import { merge } from "lodash"
import { dashingCallback, modelParameters, seed } from "./Dashing"




export interface Preset
{
	makeSeed: seed
	applyOnCreated: dashingCallback
}


export class NullPreset implements Preset
{
	applyOnCreated = ( instance, generator ) => undefined
	
	makeSeed = ( generator ) => []
}

export class ModelPreset implements Preset
{
	
	private _seed: seed
	private _onCreated: dashingCallback
	
	
	constructor( parameters: modelParameters, onCreated?: dashingCallback )
	{
		this._seed = this._normalizeParams( parameters )
		this._onCreated = onCreated || (() => undefined)
	}
	
	
	makeSeed = ( generator ) => this._seed( generator )
	
	
	applyOnCreated = ( instance, generator ) => this._onCreated( instance, generator )
	
	private _normalizeParams( parameters: modelParameters ): seed
	{
		
		return Array.isArray( parameters ) ?
		       ( g ) => parameters :
		       parameters
	}
}

export class CompositeModelPreset implements Preset
{
	private _presets: Array<Preset> = []
	
	
	constructor( ...presets: Array<Preset> )
	{
		this._presets = presets || new NullPreset()
	}
	
	
	applyOnCreated = ( instance, generator ) =>
		this._presets
			.reduce(
				( _instance, preset ) =>
					preset.applyOnCreated( _instance, generator ) || _instance,
				instance,
			)
	
	
	makeSeed = ( generator ) =>
		this._presets
			.reduce(
				( seed, preset ) =>
					merge( seed, preset.makeSeed( generator ) ),
				[],
			)
}

