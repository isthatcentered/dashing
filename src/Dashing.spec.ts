import { SimpleSeed } from "./Seed/SimpleSeed"
import { Dashing } from "./Dashing"




class SomeClass
{
	
	constructor( public param1, public param2, public param3 )
	{
	}
}


describe( `Dashing`, () => {
	
	describe( `Making a model with default config`, () => {
		
		it( `Should return the desired entity with set defaults`, () => {
			
			const director = new Dashing()
				.define( SomeClass, makeSeed() )
				.getFactory( SomeClass )
			
			const made = director.make()
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "robin" )
			expect( made.param3 ).toBe( "alfred" )
		} )
	} )
	
	describe( `Making a model with overrides`, () => {
		
		it( `Should return the desired entity with set defaults`, () => {
			
			const director = new Dashing()
				.define( SomeClass, makeSeed() )
				.getFactory( SomeClass )
			
			const made = director.make( new SimpleSeed( [ undefined, "joker", "scarecrow" ] ) )
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "joker" )
			expect( made.param3 ).toBe( "scarecrow" )
		} )
	} )
	
	/*
	 * - Defaults as array
	 * - Defaults as function
	 * - unregistered model factory
	 */
} )



function makeSeed( defaults = [ "batman", "robin", "alfred" ] )
{
	return new SimpleSeed( defaults )
}

