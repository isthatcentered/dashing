import { Builder, ModelBuilder } from "./Builder"
import * as makeDashing from "./index"
import * as faker from "faker"
import { seed } from "./Dashing"
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
			
			const factory: Builder = makeDashing()
				.define( SomeClass, makeSeed() )
				.registerPreset( "defeated", makeSeed() )
				.registerPreset( "takenOver", makeSeed() )
			
			expect( factory ).toBeInstanceOf( ModelBuilder )
		} )
		
		test( `I can make a model`, () => {
			
			const dashing = makeDashing()
			
			dashing.define( SomeClass, makeSeed() )
			
			expect( dashing( SomeClass ).make() ).toBeInstanceOf( SomeClass )
		} )
		
		test( `Every model is made with the provided defaults`, () => {
			
			const made: SomeClass = makeDashing()
				.define( SomeClass, makeSeed( "batman", "robin" ) )
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
			
			const factory: Builder = makeDashing()
				.define( SomeClass, makeSeed( "batman", "robin" ) )
				.registerPreset( "defeated", makeSeed( undefined, "joker" ) )
			
			const made: SomeClass = factory
				.preset( "defeated" )
				.make()
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "joker" )
		} )
		
		test( `When requiring multiple presets, they are applied in order of... applyance`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, makeSeed( "batman", "robin" ) )
				.registerPreset( "defeated", makeSeed( undefined, "joker" ) )
				.registerPreset( "takenOver", makeSeed( "twoface", "scarecrow" ) )
			
			const made: SomeClass = factory
				.preset( "defeated" )
				.preset( "takenOver" )
				.make()
			
			expect( made.param1 ).toBe( "twoface" )
			expect( made.param2 ).toBe( "scarecrow" )
		} )
		
		test( `I can apply multiple presets at once`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, makeSeed( "batman", "robin" ) )
				.registerPreset( "defeated", makeSeed( undefined, "joker" ) )
				.registerPreset( "takenOver", makeSeed( "twoface", "scarecrow" ) )
			
			const made: SomeClass = factory
				.preset( "defeated", "takenOver" )
				.make()
			
			expect( made.param1 ).toBe( "twoface" )
			expect( made.param2 ).toBe( "scarecrow" )
		} )
		
		test( `Every applied preset is resseted after make() for next instance`, () => {
			
			const factory = makeDashing()
				.define( SomeClass, makeSeed( "bruce" ) )
				.registerPreset( "meh", makeSeed( "alfred" ) )
			
			factory.preset( "meh" )
			
			const first: SomeClass = factory
				.make()
			
			const second: SomeClass = factory
				.make()
			
			expect( first.param1 ).toBe( "alfred" )
			expect( second.param1 ).toBe( "bruce" )
		} )
		
		test( `Trying to activate an unregisterd preset throws`, () => {
			
			const factory = makeDashing()
				.define( SomeClass, makeSeed() )
			
			expect( () => factory.preset( "meh" ) ).toThrow()
		} )
	} )
	
	describe( `Overrides`, () => {
		
		test( `I can override the model's defaults and any applied preset on make`, () => {
			
			const factory = makeDashing()
				.define( SomeClass, makeSeed( "batman", "robin" ) )
				.registerPreset( "blah", makeSeed( undefined, "batgirl" ) )
			
			const made: SomeClass = factory
				.make( makeSeed( "joker", "scarecrow" ) )
			
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
				
				const made: SomeClass = makeDashing()
					.define( SomeClass, makeSeed(), onCreatedCallback )
					.make()
				
				expect( onCreatedCallback.mock.calls[ 0 ][ 0 ] ).toBe( made )
				expect( made ).toBeInstanceOf( SomeClass )
				expect( made.getStuff() ).toBe( "alfred" )
			} )
		} )
		
		describe( `Per preset callback`, () => {
			
			test( `Callacks are triggered in order of appliance`, () => {
				
				const factory: Builder = makeDashing()
					.define( SomeClass, makeSeed(), o => {
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
				
				const factory: Builder = makeDashing()
					.define( SomeClass, makeSeed(), o => "batman" )
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
			
			const factory: Builder = makeDashing()
				.define( SomeClass, makeSeed() )
			
			const made: Array<SomeClass> = factory
				.times( 3 )
				.make()
			
			expect( made.length ).toBe( 3 )
			
			made.forEach( m => expect( m ).toBeInstanceOf( SomeClass ) )
		} )
		
		test( `Reset the desired number of instances to 1 after a make`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, makeSeed() )
			
			factory.times( 3 )
			
			const first: Array<SomeClass> = factory
				.make()
			
			const second = factory.make()
			
			expect( first.length ).toBe( 3 )
			expect( second ).toBeInstanceOf( SomeClass )
		} )
		
		test( `Each instance gets the defaults, overrides, and callbacks asked for`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, makeSeed( "batman", "robin" ) )
				.registerPreset( "breakfast", makeSeed( undefined, undefined, "batgirl" ), o => {
					o.setStuff( "waffles" )
				} )
			
			const made: Array<SomeClass> = factory
				.times( 3 )
				.preset( "breakfast" )
				.make( makeSeed( "alfred" ) )
			
			made.forEach( item => {
				expect( item.param1 ).toBe( "alfred" )
				expect( item.param2 ).toBe( "robin" )
				expect( item.getStuff() ).toBe( "waffles" )
			} )
		} )
	} )
	
	
	describe( `Using with a generator`, () => {
	
	} )
	
	describe( `Usage`, () => {
		
		
		xtest( `It comes with faker as default generator`, () => {
			
			const created: SomeClass = makeDashing( faker )// not anymore xD
			// will fail/throw anyway if generator not provided
				.define( SomeClass, ( faker: FakerStatic ) => [ faker.internet.email() ] )
				.make()
			
			expect( created.param1 ).not.toBe( undefined )
		} )
		
		test( `I can pass my own generator`, () => {
			
			
			const customGenerator = { returnFive: () => 5 }
			
			const created: SomeClass = makeDashing( customGenerator )
				.define( SomeClass, customGenerator => [ customGenerator.returnFive() ] )
				.make()
			
			expect( created.param1 ).toBe( 5 )
		} )
	} )
	
	
	
	describe( `Generating dynamic data`, () => {
		
		let GENERATOR: any
		beforeEach( () => {
			GENERATOR = {
				someNumber: () => 5,
				someString: () => "pancakes",
			}
		} )
		
		describe( `For seeds`, () => {
			describe( `Default`, () =>
				it( `Should provide the generator to the seed function`, () => {
					
					const factory: Builder = makeDashing( GENERATOR )
						.define( SomeClass, generator => [ generator.someNumber(), generator.someString() ] )
					
					const made: SomeClass = factory
						.make()
					
					expect( made.param1 ).toBe( GENERATOR.someNumber() )
					expect( made.param2 ).toBe( GENERATOR.someString() )
				} ) )
			
			describe( `State`, () =>
				it( `Should provide the generator to the seed function`, () => {
					
					const factory: Builder = makeDashing( GENERATOR )
						.define( SomeClass, makeSeed() )
					
					factory.registerPreset( "withgenerator", generator => [
						generator.someNumber(),
						generator.someString(),
					] )
					
					const made: SomeClass = factory
						.preset( "withgenerator" )
						.make()
					
					expect( made.param1 ).toBe( GENERATOR.someNumber() )
					expect( made.param2 ).toBe( GENERATOR.someString() )
				} ) )
			
			describe( `Overrides`, () =>
				it( `Should provide the generator to the seed function`, () => {
					
					const factory: Builder = makeDashing( GENERATOR )
						.define( SomeClass, makeSeed() )
					
					const made: SomeClass = factory
						.make( generator => [
							generator.someNumber(),
							generator.someString(),
						] )
					
					expect( made.param1 ).toBe( GENERATOR.someNumber() )
					expect( made.param2 ).toBe( GENERATOR.someString() )
				} ) )
		} )
		
		describe( `For onCreated callback`, () => {
			
			describe( `default`, () => {
				it( `Should provide the generator as second argument`, () => {
					
					const factory: Builder = makeDashing( GENERATOR )
						.define(
							SomeClass,
							makeSeed(),
							( instance: SomeClass, generator ) =>
								instance.setStuff( generator.someString() ),
						)
					
					const made: SomeClass = factory
						.make()
					
					expect( made.getStuff() ).toBe( GENERATOR.someString() )
				} )
			} )
			
			describe( `States`, () =>
				it( `Should provide the generator as second argument`, () => {
					
					const factory: Builder = makeDashing( GENERATOR )
						.define( SomeClass, makeSeed() )
					
					factory.registerPreset( "breakfast", makeSeed(),
						( instance: SomeClass, generator ) => {
							instance.setStuff( generator.someString() )
						},
					)
					
					const made: SomeClass = factory
						.preset( "breakfast" )
						.make()
					
					
					expect( made.getStuff() ).toBe( GENERATOR.someString() )
				} ) )
		} )
	} )
} )


function makeSeed( ...args: Array<any> ): seed
{
	return args
}