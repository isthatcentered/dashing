import { SimpleSeed } from "./SimpleSeed"
import { AbstractSeed } from "./Seed";




describe( `SimpleSeed`, () => {
	
	describe( `Instantiation`, () => {
	
		it(`Should extend from AbstractSeed`, () => {			
			expect(new SimpleSeed([])).toBeInstanceOf(AbstractSeed)
		})

		it( `Should throw if passed anything but array`, () => {
			
			const invalids = [ undefined, null, 0, "hello", {} ]
			
			invalids.forEach( ( item: any ) =>
				expect( () => new SimpleSeed( item ) ).toThrow( "Array" ) )
		} )
	} )
	
	describe( `generate()`, () => {
		
		it( `Should return immutable version of passed seed`, () => {
			
			let params = [ "thing", "otherThing" ]
			
			let generated = new SimpleSeed( params ).generate()
			
			expect( generated ).toEqual( params )
			expect( generated ).not.toBe( params )
		} )
	} )
} )