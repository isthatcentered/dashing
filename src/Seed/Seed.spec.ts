import { CompositeSeed } from "./CompositeSeed"
import Mock = jest.Mock




jest.mock( "./CompositeSeed" )


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
		this._data = [ ...data ]
	}
	
	
	generate(): modelState
	{
		return [ ...this._data ]
	}
	
	
	merge( seed: Seed ): Seed
	{
		return new CompositeSeed( [ this, seed ] )
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
	
	beforeEach( () => {
		(CompositeSeed as any).mockReset()
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
	
	describe( `merge()`, () => {
		
		it( `Should return a composite seed with current and merged in data`, () => {
			
			const seed      = new TestableSimpleSeed( [ "batman", "alfred" ] ),
			      otherSeed = makeSpySeed( [ "Robin" ] )
			
			const composite = seed.merge( otherSeed )
			
			expect( composite ).toBeInstanceOf( CompositeSeed )
			
			expect( CompositeSeed ).toHaveBeenCalledWith( [ seed, otherSeed ] )
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