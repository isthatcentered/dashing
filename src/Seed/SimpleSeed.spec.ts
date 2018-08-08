import { CompositeSeed } from "./CompositeSeed"
import { SimpleSeed } from "./SimpleSeed"
import { Seed } from "./Seed"
import { AbstractLeadSeed } from "./AbstractLeadSeed"






class TestableSimpleSeed extends SimpleSeed
{
	getData()
	{
		return this._data
	}
}

describe( `SimpleSeed`, () => {
	
	it( `Should extend AbstractLeafSeed`, () => {
		expect(new TestableSimpleSeed([])).toBeInstanceOf(AbstractLeadSeed)
	} )
	
	describe( `Instantiation`, () => {
		
		it( `Should accept an array as data`, () => {
			
			const data = [ "batman" ]
			
			expect( new TestableSimpleSeed( data ).getData() ).toEqual( data )
		} )
	} )
	
	describe( `generate()`, () => {
		
		it( `Should return a copy of original passed data`, () => {
			
			const data = [ "batman" ]
			
			const seed = new TestableSimpleSeed( data ).generate()
			
			expect( seed ).toEqual( data )
			expect( seed ).not.toBe( data )
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