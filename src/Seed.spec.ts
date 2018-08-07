export type modelState = Array<any>

export interface Seed
{
	generate(): modelState
	
	merge( seed: Seed ): Seed
}

export class NullStateSeed implements Seed
{
	generate()
	{
		return []
	}
	
	
	merge( seed: Seed )
	{
		return this
	}
}



class CompositeSeed implements Seed
{
	protected _items: Array<Seed> = []
	
	
	constructor( seed?: Seed )
	{
		if ( seed )
			this._items.push( seed )
	}
	
	
	generate()
	{
		return this._items.reduce( ( acc, i ) => [ ...acc, i.generate() ], [] )
	}
	
	
	merge( seed: Seed )
	{
		
		this._items.push( seed )
		
		return this
	}
	
}

class TestableCompositeSeed extends CompositeSeed
{
	
	getItems(): Array<Seed>
	{
		return this._items
	}
}

describe( `CompositeSeed`, () => {
	
	
	describe( `Instantiation`, () => {
		
		it( `Should instantiate with a blank collection of items`, () => {
			
			const composite = new TestableCompositeSeed()
			
			expect( composite.getItems() ).toEqual( [] )
		} )
		
		it( `Should accept a Seed as param`, () => {
			
			const seed = makeSpySeed()
			
			const composite = new TestableCompositeSeed( seed )
			
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
			
			const composite = new TestableCompositeSeed( defaultSeed )
				.merge( secondSeed )
			
			composite.generate()
			
			expect( defaultSeed.generate ).toHaveBeenCalled()
			expect( secondSeed.generate ).toHaveBeenCalled()
		} )
		
		it( `Should call first added first, last added last`, () => {
			
			let defaultSeed = makeSpySeed( "first" ),
			    secondSeed  = makeSpySeed( "second" ),
			    thirdSeed   = makeSpySeed( "third" )
			
			const composite = new TestableCompositeSeed( defaultSeed )
				.merge( secondSeed )
				.merge( thirdSeed )
			
			expect( composite.generate() ).toEqual( [ "first", "second", "third" ] )
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

