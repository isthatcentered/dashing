import { ModelBuilder } from "./ModelBuilder"




export type seedFactory = ( generator ) => any[]

export type onCreatedCallback = ( instance: any, generator: any ) => any | void

export interface FactorySlice
{
	model: Function,
	factory: ModelBuilder,
}

export class Dashing
{
	
	protected _factories: Array<FactorySlice> = []
	private _generator: any = {}
	
	
	
	constructor( _generator: any )
	{
		this._generator = _generator
	}
	
	
	define( model: Function, seed: seedFactory, onCreated?: onCreatedCallback ): ModelBuilder
	{
		const factory = new ModelBuilder( this._generator, model, seed, onCreated )
		
		this._factories.push( { model, factory } )
		
		return factory
	}
	
	
	getFactory( model: Function )
	{
		return this._getFactorySlice( model ).factory
	}
	
	
	private _getFactorySlice( model ): FactorySlice
	{
		const slice = this._factories
			.filter( fs => fs.model === model )
			.pop()
		
		if ( !slice )
			throw new Error( `No registered factory for model ${model}` )
		
		return slice
	}
}