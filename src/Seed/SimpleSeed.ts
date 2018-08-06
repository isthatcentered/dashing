import { Seed, SeedComponent } from "./Seed"




export class SimpleSeed extends SeedComponent implements Seed
{
	private readonly __seed: Array<any>
	
	
	constructor( seed: Array<any> )
	{
		super()

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
