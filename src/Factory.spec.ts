import { merge } from "lodash"
import { Seed } from "./Seed/Seed"
import Mock = jest.Mock




jest.mock( "lodash", () => ({ merge: jest.fn() }) )

export type mobjectsDataGenerator = any

export class Factory
{
	private __ref: Function
	private __seed: Seed
	
	
	constructor( use: Function, seed: Seed )
	{
		if ( typeof use !== "function" )
			throw new Error( `Please provide the class you want to be instantiated by mo'bjects\nEx: define(User, f => {)` )
		
		this.__ref = use
		
		this.__seed = seed
	}
	
	
	make( overrides: Array<any> = [] )
	{
		const args = merge( this.__seed.generate(), overrides )
		
		return new (this.__ref as any)( ...args )
	}
}


class SomeClass
{
	
	constructor( public param1: any, public param2: any, public param3: any )
	{
	}
}


describe( `Factory`, () => {
	
	beforeEach( () => {
		(merge as Mock).mockReset()
	} )
	
	describe( `Creating a factory `, () => {
		
		it( `Should throw if passing anything but class ref for "use" parameter`, () => {
			
			const invalids = [ "string", 1, {} ]
			
			invalids.forEach( invalid =>
				expect( () => makeFactory( invalid as any ) ).toThrow() )
		} )
		
		describe( `Providing defaults`, () =>
			it( `Should instantiate new class with seed result`, () => {
				
				const fakeSeedResult  = "I am the result of seed.generate()",
				      fakeMergeResult = "I am the result of merge",
				      fakeClassRef    = jest.fn(),
				      seed            = makeSpySeed( fakeSeedResult );
				
				(merge as Mock).mockReturnValue( fakeMergeResult )
				
				const created: SomeClass = makeFactory( fakeClassRef, seed as any ).make()
				
				const firstMergeCallArgument = (merge as Mock).mock.calls[ 0 ][ 0 ]
				
				expect( seed.generate ).toHaveBeenCalled()
				expect( firstMergeCallArgument ).toEqual( fakeSeedResult )
				expect( fakeClassRef ).toHaveBeenCalledWith( fakeMergeResult )
			} ) )
		
		describe( `make()`, () => {
			
			it( `Should create an actual instance of the desired object`, () => {
				
				let created = makeFactory( SomeClass )
					.make()
				
				expect( created ).toBeInstanceOf( SomeClass )
			} )
			
			describe( `Overriding defaults`, () =>
				it( `Should instantiate new class with result of _.merge of [defaults, overrides]`, () => {
					
					let defaults    = [ "batman", "robin" ],
					    overrides   = [ "waffles", "pancakes" ],
					    mergeResult = "I am the result of calling lodash's merge",
					    fakeClass   = jest.fn();
					
					(merge as Mock).mockReturnValue( mergeResult )
					
					let factory             = makeFactory( fakeClass, makeSpySeed( defaults ) ),
					    instance: SomeClass = factory.make( overrides )
					
					expect( merge ).toHaveBeenCalledWith( defaults, overrides )
					
					expect( fakeClass ).toHaveBeenCalledWith( mergeResult )
				} ) )
		} )
	} )
	
	describe( `Creating a factory state`, () => {
	
	} )
} )



function makeFactory( use: Function, seed: Seed = { generate: () => [] } )
{
	return new Factory( use, seed )
}


function makeSpySeed( generateResult?: any ): Seed
{
	return { generate: jest.fn().mockReturnValue( generateResult ) } as Seed
}