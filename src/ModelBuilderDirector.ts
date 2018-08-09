import { ModelBuilder } from "./ClassBuilder"
import { Seed } from "./Seed/Seed"




/**
 * This is what will be returned when asking for a factory/builder
 * Protects my actual implementation of builder in case changes are needed
 */
export class ModelBuilderDirector<T>
{
	private _builder: ModelBuilder<T>
	
	
	constructor( builder: ModelBuilder<T> )
	{
		this._builder = builder
		
	}
	
	
	make( overrides?: Seed, states: string[] = [] ): T
	{
		
		states.forEach( state =>
			this._builder.applyState( state ) )
		
		return this._builder.make( overrides )
	}
	
	
	registerState( state: string, overrides: Seed )
	{
		this._builder.registerState( state, overrides )
		
		return this
	}
}