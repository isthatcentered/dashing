import { Builder, ModelBuilder } from "./Builder"
import * as makeDashing from "./index"
import * as faker from "faker"
import { dashingCallback, seed } from "./Dashing"
import FakerStatic = Faker.FakerStatic



// used for below tests
class SomeClass
{
	private _stuff: any
	
	
	constructor( public param1, public param2, public param3 )
	{
	}
	
	
	setStuff( value: any )
	{
		this._stuff = value
	}
	
	
	getStuff()
	{
		return this._stuff
	}
}

describe( `Dashing`, () => {
	
	describe( `Basic usages`, () => {
		
		test( `I can define my factory in a fluent way`, () => {
			
			const factory: Builder = makeTestFactory()
				.registerPreset( "defeated", asSeed() )
				.registerPreset( "takenOver", asSeed() )
			
			expect( factory ).toBeInstanceOf( ModelBuilder )
		} )
		
		test( `I can make a model`, () => {
			
			const dashing = makeDashing()
			
			dashing.define( SomeClass, asSeed() )
			
			expect( dashing( SomeClass ).make() ).toBeInstanceOf( SomeClass )
		} )
		
		test( `Every model is made with the provided defaults`, () => {
			
			const made: SomeClass = makeTestFactory( asSeed( "batman", "robin" ) )
				.make()
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "robin" )
		} )
		
		test( `Defaults can be passed either as a function returning an array, or as an array`, () => {
			
			const firstSpy  = jest.fn(),
			      secondSpy = jest.fn(),
			      dashing   = makeDashing()
			
			dashing.define( firstSpy, [ "batman", "robin" ] )
			
			dashing( firstSpy ).make()
			
			dashing.define( secondSpy, _ => [ "alfred", "batgirl" ] )
			dashing( secondSpy ).make()
			
			expect( firstSpy ).toHaveBeenCalledWith( "batman", "robin" )
			
			expect( secondSpy ).toHaveBeenCalledWith( "alfred", "batgirl" )
		} )
	} )
	
	
	describe( `Presets`, () => {
		
		test( `I can override default model config with presets`, () => {
			
			const factory: Builder = makeTestFactory( asSeed( "batman", "robin" ) )
				.registerPreset( "defeated", asSeed( undefined, "joker" ) )
			
			const made: SomeClass = factory
				.preset( "defeated" )
				.make()
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "joker" )
		} )
		
		test( `When requiring multiple presets, they are applied in order of... applyance`, () => {
			
			const factory: Builder = makeTestFactory( asSeed( "batman", "robin" ) )
				.registerPreset( "defeated", asSeed( undefined, "joker" ) )
				.registerPreset( "takenOver", asSeed( "twoface", "scarecrow" ) )
			
			const made: SomeClass = factory
				.preset( "defeated" )
				.preset( "takenOver" )
				.make()
			
			expect( made.param1 ).toBe( "twoface" )
			expect( made.param2 ).toBe( "scarecrow" )
		} )
		
		test( `I can apply multiple presets at once`, () => {
			
			const factory: Builder = makeTestFactory( asSeed( "batman", "robin" ) )
				.registerPreset( "defeated", asSeed( undefined, "joker" ) )
				.registerPreset( "takenOver", asSeed( "twoface", "scarecrow" ) )
			
			const made: SomeClass = factory
				.preset( "defeated", "takenOver" )
				.make()
			
			expect( made.param1 ).toBe( "twoface" )
			expect( made.param2 ).toBe( "scarecrow" )
		} )
		
		test( `Every applied preset is resseted after make() for next instance`, () => {
			
			const factory = makeTestFactory( asSeed( "bruce" ) )
				.registerPreset( "meh", asSeed( "alfred" ) )
			
			factory.preset( "meh" )
			
			const first: SomeClass = factory
				.make()
			
			const second: SomeClass = factory
				.make()
			
			expect( first.param1 ).toBe( "alfred" )
			expect( second.param1 ).toBe( "bruce" )
		} )
		
		test( `Trying to activate an unregisterd preset throws`, () => {
			
			const factory = makeTestFactory()
			
			expect( () => factory.preset( "meh" ) ).toThrow()
		} )
	} )
	
	describe( `Overrides`, () => {
		
		test( `I can override the model's defaults and any applied preset on make`, () => {
			
			const factory = makeTestFactory( asSeed( "batman", "robin" ) )
				.registerPreset( "blah", asSeed( undefined, "batgirl" ) )
			
			const made: SomeClass = factory
				.make( asSeed( "joker", "scarecrow" ) )
			
			expect( made.param1 ).toBe( "joker" )
			expect( made.param2 ).toBe( "scarecrow" )
		} )
	} )
	
	describe( `After creation callback`, () => {
		
		describe( `default callback`, () => {
			
			test( `I can modify every instance after creation`, () => {
				
				const onCreatedCallback = jest.fn().mockImplementation( made => {
					made.setStuff( "alfred" )
				} )
				
				const made: SomeClass = makeTestFactory( undefined, onCreatedCallback )
					.make()
				
				expect( onCreatedCallback.mock.calls[ 0 ][ 0 ] ).toBe( made )
				expect( made ).toBeInstanceOf( SomeClass )
				expect( made.getStuff() ).toBe( "alfred" )
			} )
		} )
		
		describe( `Per preset callback`, () => {
			
			test( `Callacks are triggered in order of appliance`, () => {
				
				const factory: Builder = makeTestFactory( undefined, o => {
					o.setStuff( "alfred" )
				} )
					.registerPreset( "sleeping", () => [], o => {
						
						expect( o.getStuff() ).toBe( "alfred" )
						
						o.setStuff( "sleeping alfred" )
					} )
					.registerPreset( "awake", () => [], o => {
						
						expect( o.getStuff() ).toBe( "sleeping alfred" )
						
						o.setStuff( "awaken alfred" )
					} )
				
				const made: SomeClass = factory
					.preset( "sleeping" )
					.preset( "awake" )
					.make()
				
				expect( made.getStuff() ).toBe( "awaken alfred" )
				
				expect.assertions( 3 )
			} )
		} )
		
		describe( `Returning an object to onCreated callback`, () => {
			
			test( `Should use the returned object for all following processes`, () => {
				
				const factory: Builder = makeTestFactory( undefined, o => "batman" )
					.registerPreset( "blah", () => [], o => {
						
						expect( o ).toBe( "batman" )
						
						return "robin"
					} )
				
				const made: SomeClass = factory
					.preset( "blah" )
					.make()
				
				expect( made ).toBe( "robin" )
				
				expect.assertions( 2 )
			} )
		} )
	} )
	
	describe( `Multiple instances`, () => {
		
		test( `I can ask for multiple instances at once`, () => {
			
			const factory: Builder = makeTestFactory()
			
			const made: Array<SomeClass> = factory
				.times( 3 )
				.make()
			
			expect( made.length ).toBe( 3 )
			
			made.forEach( m => expect( m ).toBeInstanceOf( SomeClass ) )
		} )
		
		test( `Reset the desired number of instances to 1 after a make`, () => {
			
			const factory: Builder = makeTestFactory()
			
			factory.times( 3 )
			
			const first: Array<SomeClass> = factory
				.make()
			
			const second = factory.make()
			
			expect( first.length ).toBe( 3 )
			expect( second ).toBeInstanceOf( SomeClass )
		} )
		
		test( `Each instance gets the defaults, overrides, and callbacks asked for`, () => {
			
			const factory: Builder = makeTestFactory( asSeed( "batman", "robin" ) )
				.registerPreset( "breakfast", asSeed( undefined, undefined, "batgirl" ), o => {
					o.setStuff( "waffles" )
				} )
			
			const made: Array<SomeClass> = factory
				.times( 3 )
				.preset( "breakfast" )
				.make( asSeed( "alfred" ) )
			
			made.forEach( item => {
				expect( item.param1 ).toBe( "alfred" )
				expect( item.param2 ).toBe( "robin" )
				expect( item.getStuff() ).toBe( "waffles" )
			} )
		} )
	} )
	
	describe( `Dynamic data`, () => {
		
		let GENERATOR: any
		beforeEach( () => {
			GENERATOR = {
				someNumber: () => 5,
				someString: () => "pancakes",
			}
		} )
		
		
		test( `I can pass my own generator`, () => {
			
			const customGenerator = { returnFive: () => 5 }
			
			const created: SomeClass = makeDashing( customGenerator )
				.define( SomeClass, customGenerator => [ customGenerator.returnFive() ] )
				.make()
			
			expect( created.param1 ).toBe( 5 )
		} )
		
		describe( `For seeds`, () => {
			
			test( `I can use the generator with default seed`, () => {
				
				const factory: Builder = makeDashing( GENERATOR )
					.define( SomeClass, generator => [ generator.someNumber(), generator.someString() ] )
				
				const made: SomeClass = factory
					.make()
				
				expect( made.param1 ).toBe( GENERATOR.someNumber() )
				expect( made.param2 ).toBe( GENERATOR.someString() )
			} )
			
			test( `I can use the generator with presets seed`, () => {
				
				const factory: Builder = makeDashing( GENERATOR )
					.define( SomeClass, asSeed() )
				
				factory.registerPreset( "withgenerator", generator => [
					generator.someNumber(),
					generator.someString(),
				] )
				
				const made: SomeClass = factory
					.preset( "withgenerator" )
					.make()
				
				expect( made.param1 ).toBe( GENERATOR.someNumber() )
				expect( made.param2 ).toBe( GENERATOR.someString() )
			} )
			
			test( `I can use the generator with overrides seed`, () => {
				
				const factory: Builder = makeDashing( GENERATOR )
					.define( SomeClass, asSeed() )
				
				const made: SomeClass = factory
					.make( generator => [
						generator.someNumber(),
						generator.someString(),
					] )
				
				expect( made.param1 ).toBe( GENERATOR.someNumber() )
				expect( made.param2 ).toBe( GENERATOR.someString() )
			} )
		} )
		
		describe( `For onCreated callback`, () => {
			
			test( `I can use the generator with default preset callback`, () => {
				
				const factory: Builder = makeDashing( GENERATOR )
					.define( SomeClass, asSeed(), ( instance: SomeClass, generator ) =>
						instance.setStuff( generator.someString() ) )
				
				const made: SomeClass = factory
					.make()
				
				expect( made.getStuff() ).toBe( GENERATOR.someString() )
			} )
			
			test( `I can use the generator with any preset callback`, () => {
				
				const factory: Builder = makeDashing( GENERATOR )
					.define( SomeClass, asSeed() )
				
				factory.registerPreset( "breakfast", asSeed(), ( instance: SomeClass, generator ) => {
					instance.setStuff( generator.someString() )
				} )
				
				const made: SomeClass = factory
					.preset( "breakfast" )
					.make()
				
				expect( made.getStuff() ).toBe( GENERATOR.someString() )
			} )
		} )
	} )
	
	
	xtest( `It comes with faker as default generator`, () => {
		
		const created: SomeClass = makeDashing( faker )// not anymore xD
		// will fail/throw anyway if generator not provided
			.define( SomeClass, ( faker: FakerStatic ) => [ faker.internet.email() ] )
			.make()
		
		expect( created.param1 ).not.toBe( undefined )
	} )
} )


function makeTestFactory( seed: seed = asSeed(), callback?: dashingCallback ): Builder
{
	return makeDashing( {} )
		.define( SomeClass, seed, callback )
}


function asSeed( ...args: Array<any> ): seed
{
	return args
}