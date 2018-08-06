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
	
	
	registerState( state: string, seed: Seed )
	{
		if ( !state )
			throw new Error( "State name required" )
		
		if ( seed === undefined )
			throw new Error( "Seed required" )
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
		
		describe( `Registering a state`, () => {
			
			it( `Should throw if no name`, () => {
				
				let factory = makeFactory( SomeClass )
				
				expect( () => factory.registerState( "", undefined as any ) ).toThrow( "State name required" )
			} )
			
			it( `Should throw if undefined seed`, () => {
				
				let factory = makeFactory( SomeClass )
				
				expect( () => factory.registerState( "state name", undefined as any ) ).toThrow( "Seed required" )
			} )
			
			it( `Should register step when all params passed`, () => {
				
				let factory = makeFactory( SomeClass )
				
				factory.registerState( "State name", makeSeed( [ "some specific param for this state" ] ) )
			} )
		} )
		
		describe( `Getting a registered state`, () => {
			
			xit( `Should apply state parameters on top of defaults`, () => {
				
				let stateConfig = [ "some specific param for this state" ]
				
				let factory = makeFactory( SomeClass )
				
				factory.registerState( "active", makeSeed( stateConfig ) )
				
				const created: SomeClass = factory
					.applyState( "active" )
					.make()
				
				expect( created.param1 ).toBe( stateConfig[ 0 ] )
				// should reset state after a make (create new instance and test default parameters applied)
				// chain multiple states
			} )
			
			
			describe( `Multiple states at once`, () => {
			
			} )
		} )
	} )
} )



function makeFactory( use: Function, seed: Seed = makeSeed() )
{
	return new Factory( use, seed )
}


function makeSeed( params: any = [] ): Seed
{
	return { generate: () => params }
}


function makeSpySeed( generateResult?: any ): Seed
{
	return { generate: jest.fn().mockReturnValue( generateResult ) } as Seed
}