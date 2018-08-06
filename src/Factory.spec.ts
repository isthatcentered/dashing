import Mock = jest.Mock




class SomeClass
{
	constructor( public param1: any, public param2: any, public param3: any )
	{
	}
}

export type modelState = Array<any>

export interface ModelFactory<T>
{
	
	registerState( state: string, overrides: StateSeed ): this
	
	applyState( state: string ): this
	
	make(): T
}

export interface StateSeed
{
	generate(): Array<any>
	
	merge( seed: StateSeed ): StateSeed
}

class NullStateSeed implements StateSeed
{
	generate(): Array<any>
	{
		return []
	}
	
	
	merge( seed: StateSeed ): this
	{
		return this
	}
}

class ByRefModelFactory implements ModelFactory<any>
{
	protected readonly _seed: StateSeed
	protected readonly _ref: Function
	protected _states: { [ state: string ]: StateSeed } = {}
	protected _state: StateSeed = new NullStateSeed()
	
	
	constructor( ref: Function, seed: StateSeed )
	{
		this._ref = ref
		
		this._seed = seed
	}
	
	
	make( overrides: StateSeed = new NullStateSeed() )
	{
		const params = this._seed
			.merge( overrides )
			.merge( this._state )
		
		return new (this._ref as any)( ...params.generate() )
	}
	
	
	applyState( state: string ): this
	{
		
		this._state = this._states[ state ]
		
		return this
	}
	
	
	registerState( state: string, overrides: StateSeed ): this
	{
		if ( this._hasState( state ) )
			throw new Error( "Cannot register a state twice" )
		
		this._states[ state ] = overrides
		
		return this
	}
	
	
	private _hasState( state: string ): boolean
	{
		return this._states[ state ] !== undefined
	}
}

class TestableByRefModelFactory extends ByRefModelFactory
{
	
	getRegisteredStates(): { [ name: string ]: StateSeed }
	{
		return this._states
	}
	
	
	getActivatedState(): StateSeed
	{
		return this._state
	}
}

describe( `ByRefModelFactory`, () => {
	
	
	describe( `Instantiation`, () =>
		it( `Should instantiate without errors`, () => {
			new ByRefModelFactory( SomeClass, makeSpySeed() )
		} ) )
	
	describe( `Creating a model with make()`, () => {
		
		describe( `Providing default state`, () =>
			it( `Should instantiate new class with default seed result`, () => {
				
				let seedResult = [ "batman", "alfred", "robin" ]
				
				let made = new ByRefModelFactory( SomeClass, makeSpySeed( seedResult ) )
					.make()
				
				expect( made ).toBeInstanceOf( SomeClass )
				
				expect( made.param1 ).toBe( "batman" )
				expect( made.param2 ).toBe( "alfred" )
				expect( made.param3 ).toBe( "robin" )
			} ) )
		
		describe( `Overriding default state`, () =>
			it( `Should instantiate new class with result of defaultSeed.merge( overrideSeed ) as params`, () => {
				
				let defaultSeed: StateSeed  = makeSpySeed( [ "overriden by mock config" ] ),
				    overrideSeed: StateSeed = makeSpySeed( [ "overriden by mock config" ] ),
				    mockReturn              = [ "The mock return" ];
				
				(defaultSeed.generate as Mock).mockReturnValue( mockReturn )
				
				let made = new ByRefModelFactory( SomeClass, defaultSeed )
					.make( overrideSeed )
				
				expect( defaultSeed.merge ).toHaveBeenCalledWith( overrideSeed )
				
				expect( made.param1 ).toBe( mockReturn[ 0 ] )
			} ) )
	} )
	
	
	describe( `Registering a model state with registerState()`, () => {
		
		it( `Should accept a name and a seed`, () => {
			
			let stateSeed = makeSpySeed()
			
			const factory = new TestableByRefModelFactory( SomeClass, makeSpySeed() )
				.registerState( "stateName", stateSeed )
			
			expect( factory.getRegisteredStates()[ "stateName" ] ).toBe( stateSeed )
		} )
		
		it( `Should be fluent`, () => {
			
			let factory = new ByRefModelFactory( SomeClass, makeSpySeed() )
			
			expect( factory.registerState( "stateName", makeSpySeed() ) ).toBeInstanceOf( ByRefModelFactory )
		} )
		
		it( `Should throw if state is already defined`, () => {
			
			const factory = new TestableByRefModelFactory( SomeClass, makeSpySeed() )
				.registerState( "SAMENAME", makeSpySeed() )
			
			expect( () => factory.registerState( "SAMENAME", makeSpySeed() ) ).toThrow()
		} )
		
		xit( `Should format name in case passed spaces and stuff`, () => {
		
		} )
	} )
	
	describe( `Applying a state to model with applyState()`, () => {
		
		describe( `Single state`, () => {
			
			it( `Should override default state with result of state`, () => {
				
				let defaultSeed: StateSeed   = makeSpySeed( [ "result of default state seed generate" ] ),
				    overridesSeed: StateSeed = makeSpySeed(),
				    stateSeed                = makeSpySeed()
				
				let factory = new TestableByRefModelFactory( SomeClass, defaultSeed )
					.registerState( "STATE", stateSeed )
				
				factory.applyState( "STATE" )
				
				expect( factory.getActivatedState() ).toBe( stateSeed )
				
				let made = factory.make( overridesSeed )
				
				expect( defaultSeed.merge ).toHaveBeenNthCalledWith( 1, overridesSeed )
				expect( defaultSeed.merge ).toHaveBeenNthCalledWith( 2, stateSeed )
				
				expect( made.param1 ).toBe( "result of default state seed generate" )
			} )
			
			describe( `Throw if state not registered`, () => {
			
			} )
			
			describe( `Should be fluent`, () => {
			
			} )
		} )
		
		describe( `Multiple states`, () => {
			// called merge on cirrent state
		} )
		
		describe( `With overrides on top`, () => {
		
		} )
	} )
} )


function makeSpySeed( returns: any[] = [] ): StateSeed
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