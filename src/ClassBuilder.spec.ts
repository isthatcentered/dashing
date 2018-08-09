import Mock = jest.Mock
import { Seed} from "./Seed/Seed"
import { ClassBuilder } from "./ClassBuilder"
import { SimpleSeed } from "./Seed/SimpleSeed"
import { NullSeed } from "./Seed/NullSeed"




class SomeClass
{
	constructor( public param1: any, public param2: any, public param3: any )
	{
	}
}

class TestableClassBuilder extends ClassBuilder
{
	
	protected _state = makeSpySeed()
	
	
	getActiveStateSpySeed(): Seed
	{
		return this._state
	}
	
	
	getRegisteredStates(): { [ name: string ]: Seed }
	{
		return this._states
	}
	
	
	getActivatedState(): Seed
	{
		return this._state
	}
}

describe( `ClassBuilder`, () => {
	
	
	describe( `Instantiation`, () =>
		it( `Should instantiate without errors`, () => {
			new ClassBuilder( SomeClass, makeSpySeed() )
		} ) )
	
	describe( `Creating a model with make()`, () => {
		
		describe( `Providing default state`, () =>
			it( `Should instantiate new class with default seed result`, () => {
				
				let seedResult = [ "batman", "alfred", "robin" ]
				
				let made = new ClassBuilder( SomeClass, makeSpySeed( seedResult ) )
					.make()
				
				expect( made ).toBeInstanceOf( SomeClass )
				
				expect( made.param1 ).toBe( "batman" )
				expect( made.param2 ).toBe( "alfred" )
				expect( made.param3 ).toBe( "robin" )
			} ) )
		
		describe( `Overriding default state`, () =>
			it( `Should instantiate new class with result of defaultSeed.merge( overrideSeed ) as params`, () => {
				
				let defaultSeed: Seed  = makeSpySeed(),
				    overrideSeed: Seed = makeSpySeed(),
				    mockReturn         = [ "The mock return" ];
				
				(defaultSeed.generate as Mock).mockReturnValue( mockReturn )
				
				let made = new ClassBuilder( SomeClass, defaultSeed )
					.make( overrideSeed )
				
				expect( defaultSeed.merge ).toHaveBeenCalledWith( overrideSeed )
				
				expect( made.param1 ).toBe( mockReturn[ 0 ] )
			} ) )
	} )
	
	describe( `Registering a model state with registerState()`, () => {
		
		it( `Should accept a name and a seed`, () => {
			
			let stateSeed = makeSpySeed()
			
			const factory = new TestableClassBuilder( SomeClass, makeSpySeed() )
				.registerState( "stateName", stateSeed )
			
			expect( factory.getRegisteredStates()[ "stateName" ] ).toBe( stateSeed )
		} )
		
		it( `Should be fluent`, () => {
			
			let factory = new ClassBuilder( SomeClass, makeSpySeed() )
			
			expect( factory.registerState( "stateName", makeSpySeed() ) ).toBeInstanceOf( ClassBuilder )
		} )
		
		it( `Should throw if state is already defined`, () => {
			
			const factory = new TestableClassBuilder( SomeClass, makeSpySeed() )
				.registerState( "SAMENAME", makeSpySeed() )
			
			expect( () => factory.registerState( "SAMENAME", makeSpySeed() ) ).toThrow()
		} )
		
		xit( `Should format name in case passed spaces and stuff`, () => {
		
		} )
	} )
	
	describe( `Applying a state to model with applyState()`, () => {
		
		it( `Should be fluent`, () => {
			
			let factory = new TestableClassBuilder( SomeClass, makeSpySeed() ).registerState( "meh", makeSpySeed() )
			
			expect( factory.applyState( "meh" ) ).toBeInstanceOf( ClassBuilder )
		} )
		
		it( `Should throw if state not registered`, () => {
			
			let factory = new TestableClassBuilder( SomeClass, makeSpySeed() )
			
			expect( Object.keys( factory.getRegisteredStates() ) ).not.toContain( "TEST_STATE" )
			
			expect( () => factory.applyState( "TEST_STATE" ) ).toThrow()
		} )
		
		it( `Should merge each new state with active state`, () => {
			
			let stateSeed1 = makeSpySeed(),
			    stateSeed2 = makeSpySeed()
			
			let factory = new TestableClassBuilder( SomeClass, makeSpySeed() )
				.registerState( "STATE_1", stateSeed1 )
				.registerState( "STATE_2", stateSeed2 )
				.applyState( "STATE_1" )
				.applyState( "STATE_2" )
			
			expect( factory.getActiveStateSpySeed().merge ).toHaveBeenCalledTimes( 2 )
			expect( factory.getActiveStateSpySeed().merge ).toHaveBeenNthCalledWith( 1, stateSeed1 )
			expect( factory.getActiveStateSpySeed().merge ).toHaveBeenNthCalledWith( 2, stateSeed2 )
		} )
		
		it( `Should merge active state into default state on make`, () => {
			
			let defaultSeed = makeSpySeed()
			
			let factory = new TestableClassBuilder( SomeClass, defaultSeed )
				.registerState( "STATE", makeSpySeed() )
				.applyState( "STATE" )
			
			let stateSeed = factory.getActiveStateSpySeed()
			
			factory.make()
			
			expect( defaultSeed.merge ).lastCalledWith( stateSeed )
		} )
		
		it( `Should reset active state on make`, () => {
			
			const stateSeed = makeSpySeed()
			
			const factory = new TestableClassBuilder( SomeClass, makeSpySeed() )
				.registerState( "STATE", stateSeed )
				.applyState( "STATE" )
			
			const activatedState = factory.getActivatedState()
			
			factory.make()
			
			expect( factory.getActivatedState() ).not.toBe( activatedState )
			expect( factory.getActivatedState() ).toBeInstanceOf( NullSeed )
		} )
		
		it( `Should apply states on top of overrides`, () => {
			
			const defaultSeed   = makeSpySeed(),
			      overridesSeed = makeSpySeed()
			
			const factory = new TestableClassBuilder( SomeClass, defaultSeed )
			
			const stateSeed = factory.getActivatedState()
			
			factory.make( overridesSeed )
			
			expect( defaultSeed.merge ).toHaveBeenCalledWith( overridesSeed )
			expect( defaultSeed.merge ).toHaveBeenLastCalledWith( stateSeed )
		} )
	} )
} )


function makeSpySeed( returns: any[] = [] ): Seed
{
	return {
		generate: jest.fn().mockReturnValue( returns ),
		merge:    jest.fn().mockReturnThis(),
	} as any
}


/*
import { merge } from "lodash"
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

xdescribe( `Factory`, () => {
	
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
*/