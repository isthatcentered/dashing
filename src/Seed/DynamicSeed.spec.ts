import { Seed, SeedComponent } from "./Seed"
import { DynamicSeed } from "./DynamicSeed"




describe( `Dynamic seed`, () => {
	
	describe( `Instantiating`, () => {
		
		it(`Should extend from AbstractSeed`, () => {			
			expect(makeDynamicSeed(_ => [])).toBeInstanceOf(SeedComponent)
		})

		it( `Should throw if passed anything but function`, () => {
			
			const invalids = [ undefined, null, 0, "hello", {} ]
			
			invalids.forEach( ( item: any ) =>
				expect( () => makeDynamicSeed( item ) ).toThrow( "function" ) )
		} )
		
		it( `Should throw if function doesn't return an Array`, () => {
			
			const invalidFunctions = [ _ => ({}), _ => "", _ => 3, _ => null, _ => undefined ]
			
			invalidFunctions.forEach( ( f: any ) =>
				expect( () => makeDynamicSeed( f ) ).toThrow( "returning Array" ) )
		} )
		
		it( `Should work with any function returning an array`, () => {
			
			expect( () => makeDynamicSeed( _ => [ "thing" ] ) ).not.toThrow()
		} )
	} )
	
	describe( `generate()`, () => {
		
		it( `Should return the result of function`, () => {
			
			let fnReturn = [ "batman" ]
			
			expect( makeDynamicSeed( _ => fnReturn ).generate() ).toEqual( fnReturn )
		} )
		
		it( `Should provide generator to function`, () => {
			
			const generator = { returnPassedNumber: jest.fn().mockImplementation( arg => arg ) },
			      factory   = g => [ g.returnPassedNumber( 3 ) ]
			
			const generated = makeDynamicSeed( factory, generator ).generate()
			
			expect( generated ).toEqual( [ 3 ] )
			
			expect( generator.returnPassedNumber ).toHaveBeenCalledWith( 3 )
		} )
	} )
} )


function makeDynamicSeed( factory: any, generator = {} ): Seed
{
	return new DynamicSeed( generator, factory )
}
