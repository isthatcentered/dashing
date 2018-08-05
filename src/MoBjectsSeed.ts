import { Fakery } from "./index.spec"
import { mobjectsDataGenerator } from "./Factory.spec"




export interface Seed
{
	generate(): Array<any>
}

export class MoBjectsSeed implements Seed
{
	
	private __seed: Fakery
	private __dataGenerator
	
	
	constructor( dataGenerator: mobjectsDataGenerator, seed: Fakery )
	{
		if ( !MoBjectsSeed.isValid( seed, dataGenerator ) )
			throw new Error( `Seed must either be Array or Function returning Array.` )
		
		this.__seed = seed
		this.__dataGenerator = dataGenerator
	}
	
	
	static isValid( seed: Fakery, generator: mobjectsDataGenerator ): boolean
	{
		if ( typeof seed !== "function" && !Array.isArray( seed ) )
			return false
		
		if ( typeof seed === "function" && !Array.isArray( seed( generator ) ) )
			return false
		
		return true
	}
	
	
	generate(): Array<any>
	{
		return Array.isArray( this.__seed ) ?
		       [ ...this.__seed ] :
		       this.__seed( this.__dataGenerator )
	}
}


