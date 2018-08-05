import { SimpleSeed } from "./SimpleSeed"




describe( `SimpleSeed`, () => {
	
	describe( `Instantiation`, () => {
		
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