import { ClassModelBuilderDirector, ModelBuilderDirector } from "./ModelBuilderDirector"
import { Seed } from "./Seed/Seed"
import { ClassBuilder } from "./ClassBuilder"
import { NullClassModelBuilderDirector } from "./NullClassModelBuilderDirector"




export interface BuilderStoreSlice
{
	ref: Function,
	director: ModelBuilderDirector<any>
}

export class Dashing
{
	
	protected _registered: BuilderStoreSlice[] = []
	
	
	getFactory( model: Function ): ModelBuilderDirector<any>
	{
		
		return this._get( model )
	}
	
	
	define( model: Function, defaults: Seed ): this
	{
		this._registered.push( {
			ref:      model,
			director: this._makeDirector( model, defaults ),
		} )
		
		return this
	}
	
	
	protected _get( model: Function ): ModelBuilderDirector<any>
	{
		return (this._registered
			.filter( r => r.ref === model ).pop() ||
			{ director: new NullClassModelBuilderDirector() }).director
	}
	
	
	protected _makeDirector( model: Function, seed: Seed )
	{
		return new ClassModelBuilderDirector( new ClassBuilder( model, seed ) )
	}
}