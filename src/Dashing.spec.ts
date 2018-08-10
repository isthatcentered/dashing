// Holds collection of directors
// If builder already set throw
// If not set create
// Return builder
//

import { ClassModelBuilderDirector, ModelBuilderDirector } from "./ModelBuilderDirector"
import { ClassBuilder } from "./ClassBuilder"
import { Seed } from "./Seed/Seed"




class SomeClass
{

}

interface BuilderStoreSlice
{
	ref: Function,
	director: ModelBuilderDirector<any>
}

export class NullClassModelBuilderDirector implements ModelBuilderDirector<any>
{
	make( overrides?, states? )
	{
		return {}
	}
	
	
	registerState( state, overrides ): this
	{
		return this
	}
}

class Dashing
{
	
	protected _registered: BuilderStoreSlice[] = []
	
	
	handle( model: Function ): ModelBuilderDirector<any>
	{
		
		return this._get( model )
	}
	
	
	define( model: Function, defaults: string[] | Function ): this
	{
		this._registered.push( {
			ref:      model,
			director: this._makeDirector( model, this._makeSeed( defaults ) ),
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
	
	
	protected _makeSeed( defaults: string[] | Function ): Seed
	{
		return undefined
	}
}

class TestableDashing extends Dashing
{
	
	getRegistered(): BuilderStoreSlice[]
	{
		return this._registered
	}
	
	
}


describe( `Dashing`, () => {
	
	describe( `define()`, () => {
		
		it( `Should be fluent`, () => {
			expect( new TestableDashing().define( SomeClass, [] ) ).toBeInstanceOf( Dashing )
		} )
		
		it( `Should register a new director for passed model`, () => {
			
			const overrides = []
			const dashing = new TestableDashing()
			
			dashing._makeDirector = jest.fn()
			dashing._makeSeed = jest.fn().mockReturnValue( "batman" )
			
			dashing.define( SomeClass, overrides )
			
			expect( dashing._makeDirector ).toHaveBeenCalledWith( SomeClass, "batman" )
			expect( dashing._makeSeed ).toHaveBeenCalledWith( overrides )
		} )
	} )
	/*
	xdescribe( `Defining a new model factory`, () => {
		it( `Should register facotry for later access`, () => {
			
			
			const dashing  = new TestableDashing(),
			      defaults = [ "batman" ]
			
			const director = dashing.define( SomeClass, defaults )
				.getFactory( SomeClass )
			
			expect( director ).toBeInstanceOf( ClassModelBuilderDirector )
			
		} )
	} )
	
	xdescribe( `Making a model`, () => {
		
		
		it( `Should return an instance of passed model with defaults`, () => {
		
		} )
		
		// faker defaults
		describe( `Dynamic defaults`, () => {
		
		} )
		
	} )
	
	test( ``, () => {
	
	} )
	*/
} )


