import { mobjectsDataGenerator } from "../Factory.spec"
import { paramsFactory, Seed } from "./Seed"




export class DynamicSeed implements Seed
{
	private readonly __generator: mobjectsDataGenerator
	private readonly __factory: paramsFactory
	
	
	constructor( generator: mobjectsDataGenerator, factory: paramsFactory )
	{
		
		if ( !this.__isValid( factory, generator ) )
			throw new Error( "Seed must be a function returning Array" )
		
		this.__generator = generator
		
		this.__factory = factory
	}
	
	
	generate(): Array<any>
	{
		return this.__factory( this.__generator )
	}
	
	
	private __isValid = ( factory: paramsFactory, generator: mobjectsDataGenerator ) =>
		typeof factory === "function" &&
		Array.isArray( ((factory as paramsFactory)( generator )) )
}