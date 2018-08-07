import { CompositeSeed } from "./CompositeSeed.spec"




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

export class simpleSeed implements Seed
{
	
	protected readonly _data!: modelState
	
	
	constructor( data: modelState )
	{
		this._data = [...data]
	}
	
	
	generate(): modelState
	{
		return [...this._data]
	}
	
	
	merge( seed: Seed ): Seed
	{
		return new CompositeSeed([this,seed])
	}
	
	
}

class TestableSimpleSeed extends simpleSeed
{
	getData()
	{
		return this._data
	}
}

describe( `SimpleSeed`, () => {
	
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
	
	xdescribe( `merge()`, () => {
		
		it( `Should return a composite seed with current and merged in data`, () => {
			
			const data = [ "batman", "alfred" ]
			
			const seed = new TestableSimpleSeed( data ).merge(makeSpySeed("robin"))
			
			expect( seed ).toBeInstanceOf( CompositeSeed )
			
			expect(seed.generate()).toEqual(["robin", "alfred"])
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