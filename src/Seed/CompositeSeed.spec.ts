import { Seed } from "./Seed.spec"
import { merge } from "lodash"
import Mock = jest.Mock




jest.mock( "lodash", () => ({ merge: jest.fn() }) )


export class CompositeSeed implements Seed
{
	protected _items: Array<Seed> = []
	
	
	constructor( seeds?: Array<Seed> )
	{
		if ( seeds && seeds.length )
			seeds.forEach( s => this._items.push( s ) )
	}
	
	
	generate()
	{
		return this._items.length ?
		       this._items
			       .reduce(
				       ( acc: any[], i: Seed ) =>
					       merge( acc, i.generate() ),
				       [],
			       ) :
		       []
	}
	
	
	merge( seed: Seed )
	{
		
		this._items.push( seed )
		
		return this
	}
	
}

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
			
			(merge as jest.Mock).mockImplementation( (() => {
				
				let args = ""
				
				return val => {
					args += val
					console.log( "args:::", args )
					return args
				}
			})() ) // return passed arg
			
			const composite = new TestableCompositeSeed( [ defaultSeed ] )
				.merge( secondSeed )
				.merge( thirdSeed )
			
			composite.generate()
			
			expect( merge ).toHaveBeenCalledTimes( 3 )
			
			console.log( merge.mock.calls )
			expect( merge ).toHaveBeenNthCalledWith( 2, defaultSeed.generate(), secondSeed.generate() )
			
			// expect( merge ).toHaveBeenNthCalledWith( 1, secondSeed.generate(), thirdSeed.generate() )
			
			// expect( composite.generate() ).toEqual( "first second third" )
		} )
	} )
} )



function makeSpySeed( returns: any = [] ): Seed
{
	return {
		generate: jest.fn().mockReturnValue( returns ),
		merge:    jest.fn(),
	}
}