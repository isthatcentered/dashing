import { ModelBuilder } from "./ClassBuilder"
import { Seed } from "./Seed/Seed"




export interface ModelBuilderDirector<T>
{
	make( overrides?: Seed, states?: string[] ): T
	
	registerState( state: string, overrides: Seed ): this
}

/**
 * This is what will be returned when asking for a factory/builder
 * Protects my actual implementation of builder in case changes are needed
 */
export class ClassModelBuilderDirector<T> implements ModelBuilderDirector<T>
{
	private _builder: ModelBuilder<T>
	
	
	constructor( builder )
	{
		this._builder = builder
		
	}
	
	
	make( overrides?, states = [] ): T
	{
		
		states.forEach( state =>
			this._builder.applyState( state ) )
		
		return this._builder.make( overrides )
	}
	
	
	registerState( state, overrides )
	{
		this._builder.registerState( state, overrides )
		
		return this
	}
}