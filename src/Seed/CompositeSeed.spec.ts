import { Seed } from "./Seed"
import { merge } from "lodash"
import { CompositeSeed } from "./CompositeSeed"
import Mock = jest.Mock




jest.mock( "lodash", () => ({ merge: jest.fn() }) )


export class TestableCompositeSeed extends CompositeSeed
{
	
	getItems(): Array<Seed>
	{
		return this._items
	}
}



describe( `CompositeSeed`, () => {
	
	beforeEach( () => {
		(merge as Mock).mockClear()
	} )
	
	describe( `Instantiation`, () => {
		
		it( `Should instantiate with a blank collection of items`, () => {
			
			const composite = new TestableCompositeSeed()
			
			expect( composite.getItems() ).toEqual( [] )
		} )
		
		it( `Should accept a Seed as param`, () => {
			
			const seed = makeSpySeed()
			
			const composite = new TestableCompositeSeed( [ seed ] )
			
			expect( composite.getItems() ).toContain( seed )
		} )
	} )
	
	describe( `merge()`, () => {
		
		it( `Should add passed item to collection`, () => {
			
			const otherSeed = makeSpySeed()
			
			const composite = new TestableCompositeSeed()
			
			composite.merge( otherSeed )
			
			expect( composite.getItems() ).toContain( otherSeed )
		} )
	} )
	
	describe( `generate()`, () => {
		
		it( `Should call generate on each of it's contained Seeds`, () => {
			
			const defaultSeed = makeSpySeed( "first" ),
			      secondSeed  = makeSpySeed( "second" )
			
			const composite = new TestableCompositeSeed( [ defaultSeed ] )
				.merge( secondSeed )
			
			composite.generate()
			
			expect( defaultSeed.generate ).toHaveBeenCalled()
			expect( secondSeed.generate ).toHaveBeenCalled()
		} )
		
		it( `Should return empty array if no seeds contained`, () => {
			expect( new TestableCompositeSeed().generate() ).toEqual( [] )
		} )
		
		xit( `Should call first added first, last added last`, () => {
			
			let defaultSeed = makeSpySeed( "first" ),
			    secondSeed  = makeSpySeed( "second" ),
			    thirdSeed   = makeSpySeed( "third" )
			
			const composite = new TestableCompositeSeed( [ defaultSeed ] )
				.merge( secondSeed )
				.merge( thirdSeed )
			
			expect( composite.generate() ).toEqual( [ "first", "second", "third" ] )
		} )
		
		it( `Should merge the result of each seed into an array`, () => {
			
			let defaultSeed = makeSpySeed( "first" ),
			    secondSeed  = makeSpySeed( "second" ),
			    thirdSeed   = makeSpySeed( "third" );
			
			(merge as jest.Mock).mockImplementation( ( ...args ) => args.join( "" ) )
			
			const composite = new TestableCompositeSeed( [ defaultSeed ] )
				.merge( secondSeed )
				.merge( thirdSeed )
			
			composite.generate()
			
			expect( merge ).toHaveBeenCalledTimes( 3 )
			
			expect( merge ).toHaveBeenNthCalledWith( 1, expect.anything(), defaultSeed.generate() )
			expect( merge ).toHaveBeenNthCalledWith( 2, defaultSeed.generate(), secondSeed.generate() )
			expect( merge ).toHaveBeenNthCalledWith( 3, expect.stringContaining( secondSeed.generate() as any ), thirdSeed.generate() ) // returns [ "firstsecond", "third"]
		} )
	} )
} )

merge.mockRestore()


function makeSpySeed( returns: any = [] ): Seed
{
	return {
		generate: jest.fn().mockReturnValue( returns ),
		merge:    jest.fn(),
	}
}