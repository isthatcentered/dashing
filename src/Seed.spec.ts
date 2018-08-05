import { Fakery } from "./index.spec"
import { MoBjectsSeed } from "./MoBjectsSeed"





describe( `Seed`, () => {
	
	describe( `Creating a seed`, () => {
		
		it( `Should throw if seed neither array nore function`, () => {
			
			const invalids = [ "string", 0, {} ]
			
			invalids.forEach( ( invalid: any ) =>
				expect( () => makeSeed( invalid ) ).toThrow() )
		} )
		
		it( `Should throw if seed is function but doesn't return array`, () => {
			expect( () => makeSeed( () => ({}) ) ).toThrow()
		} )
	} )
	
	describe( `Generate()`, () => {
		
		describe( `Seed as array`, () =>
			it( `Should return copy of passed array`, () => {
				
				let params    = [ "hello", "world" ],
				    generated = makeSeed( params ).generate()
				
				// immutability check
				expect( generated ).not.toBe( params )
				
				expect( generated ).toEqual( params )
				
				expect( Array.isArray( generated ) ).toBe( true )
			} ) )
		
		describe( `Seed as function`, () =>
			it( `Should return result of function as array`, () => {
				
				let param     = () => [ "hello", "world" ],
				    generated = makeSeed( param ).generate()
				
				expect( generated ).toEqual( param() )
				
				expect( Array.isArray( generated ) ).toBe( true )
			} ) )
		
		
		describe( `Generating data automatically`, () =>
			it( `Should populate seed`, () => {
				
				const seed = makeSeed( generator =>
					[ generator.randomNumber( 3 ) ] )
				
				expect( seed.generate() ).toEqual( [ 3 ] )
			} ) )
	} )
} )

function makeSeed( params: Fakery = [] ): MoBjectsSeed
{
	return new MoBjectsSeed( { randomNumber: ( num ) => num }, params )
}