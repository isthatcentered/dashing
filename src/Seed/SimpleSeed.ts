import { Seed } from "./Seed"




export class SimpleSeed implements Seed
{
	private readonly __seed: Array<any>
	
	
	constructor( seed: Array<any> )
	{
		if ( !this.__isValid( seed ) )
			throw new Error( `Seed must be passed as Array` )
		
		this.__seed = seed
	}
	
	
	generate(): Array<any>
	{
		return [ ...this.__seed ]
	}
	
	
	private __isValid( seed: Array<any> )
	{
		return Array.isArray( seed )
	}
}
