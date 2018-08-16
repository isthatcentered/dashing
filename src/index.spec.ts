import { Builder, ModelBuilder } from "./Builder"
import * as makeDashing from "./index"
import FakerStatic = Faker.FakerStatic
import * as faker from "faker"



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
	
	describe( `Usage`, () => {
		
		test( `I can configure my factory right after defining it`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, _ => [] )
				.registerState( "defeated", _ => [] )
				.registerState( "takenOver", _ => [] )
			
			expect( factory ).toBeInstanceOf( ModelBuilder )
		} )
		
		test( `I can get a factory using dashing(ClassName)`, () => {
			
			const dashing = makeDashing()
			
			dashing.define( SomeClass, _ => [] )
			
			expect( dashing( SomeClass ).make() ).toBeInstanceOf( SomeClass )
		} )
		
		xtest( `It comes with faker as default generator`, () => {
			
			const created: SomeClass = makeDashing(faker)// not anymore xD
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
	
	
	describe( `Providing a default model state`, () =>
		it( `Should apply given defaults as instance's constructor params`, () => {
			
			const made: SomeClass = makeDashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.make()
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "robin" )
		} ) )
	
	describe( `States`, () => {
		
		it( `Should return model constructed with state override`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.registerState( "defeated", _ => [ undefined, "joker" ] )
			
			const made: SomeClass = factory
				.applyState( "defeated" )
				.make()
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "joker" )
		} )
		
		it( `Should override default state in order of applyance`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.registerState( "defeated", _ => [ undefined, "joker" ] )
				.registerState( "takenOver", _ => [ "twoface", "scarecrow" ] )
			
			const made: SomeClass = factory
				.applyState( "defeated" )
				.applyState( "takenOver" )
				.make()
			
			expect( made.param1 ).toBe( "twoface" )
			expect( made.param2 ).toBe( "scarecrow" )
		} )
		
		it( `Should allow me to apply multiple states at once for convenience`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.registerState( "defeated", _ => [ undefined, "joker" ] )
				.registerState( "takenOver", _ => [ "twoface", "scarecrow" ] )
			
			const made: SomeClass = factory
				.applyState( "defeated", "takenOver" )
				.make()
			
			expect( made.param1 ).toBe( "twoface" )
			expect( made.param2 ).toBe( "scarecrow" )
		} )
		
		it( `Should not inherit applied states of previous item on creation`, () => {
			
			const factory = makeDashing()
				.define( SomeClass, _ => [ "bruce" ] )
				.registerState( "meh", _ => [ "alfred" ] )
			
			factory.applyState( "meh" )
			
			const first: SomeClass = factory
				.make()
			
			const second: SomeClass = factory
				.make()
			
			expect( first.param1 ).toBe( "alfred" )
			
			expect( second.param1 ).toBe( "bruce" )
		} )
		
		it( `Should throw when asking for unregistered state`, () => {
			
			const factory = makeDashing()
				.define( SomeClass, _ => [] )
			
			expect( () => factory.applyState( "meh" ) ).toThrow()
		} )
	} )
	
	describe( `After creation hook`, () => {
		
		describe( `Default for every new instance`, () =>
			it( `Should apply onCreated callback to newly created instance`, () => {
				
				const onCreatedCallback = jest.fn().mockImplementation( made => {
					made.setStuff( "alfred" )
				} )
				
				const made: SomeClass = makeDashing()
					.define( SomeClass, _ => [], onCreatedCallback )
					.make()
				
				expect( onCreatedCallback.mock.calls[ 0 ][ 0 ] ).toBe( made )
				expect( made ).toBeInstanceOf( SomeClass )
				expect( made.getStuff() ).toBe( "alfred" )
			} ) )
		
		describe( `Per state`, () =>
			it( `Should apply each state's oncreated callback in order of applyance`, () => {
				
				const factory: Builder = makeDashing()
					.define( SomeClass, _ => [], o => {
						o.setStuff( "alfred" )
					} )
					.registerState( "sleeping", () => [], o => {
						
						expect( o.getStuff() ).toBe( "alfred" )
						
						o.setStuff( "sleeping alfred" )
					} )
					.registerState( "awake", () => [], o => {
						
						expect( o.getStuff() ).toBe( "sleeping alfred" )
						
						o.setStuff( "awaken alfred" )
					} )
				
				const made: SomeClass = factory
					.applyState( "sleeping" )
					.applyState( "awake" )
					.make()
				
				expect( made.getStuff() ).toBe( "awaken alfred" )
				
				expect.assertions( 3 )
			} ) )
		
		describe( `Returning an object to onCreated callback`, () => {
			it( `Should use the returned object for following processes`, () => {
				
				const factory: Builder = makeDashing()
					.define( SomeClass, _ => [], o => "batman" )
					.registerState( "blah", () => [], o => {
						
						expect( o ).toBe( "batman" )
						
						return "robin"
					} )
				
				const made: SomeClass = factory
					.applyState( "blah" )
					.make()
				
				expect( made ).toBe( "robin" )
				
				expect.assertions( 2 )
			} )
		} )
	} )
	
	describe( `Overrides on make()`, () =>
		it( `Should apply overrides on top of default AND states params`, () => {
			
			const factory = makeDashing()
				.define( SomeClass, _ => [ "batman" ] )
				.registerState( "blah", _ => [ "robin" ] )
			
			const made: SomeClass = factory
				.make( _ => [ "alfred" ] )
			
			expect( made.param1 ).toBe( "alfred" )
		} ) )
	
	describe( `Generating multiple instances automatically`, () => {
		it( `Should generate the desired number of instance`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, _ => [] )
			
			const made: Array<SomeClass> = factory
				.times( 3 )
				.make()
			
			expect( made.length ).toBe( 3 )
			
			made.forEach( m => expect( m ).toBeInstanceOf( SomeClass ) )
		} )
		
		it( `Should reset the "times" count after make for next object`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, _ => [] )
			
			factory.times( 3 )
			
			const first: Array<SomeClass> = factory
				.make()
			
			const second = factory.make()
			
			expect( first.length ).toBe( 3 )
			expect( second ).toBeInstanceOf( SomeClass )
		} )
		
		it( `Should still apply defaults, overrides, and callbacks to each one`, () => {
			
			const factory: Builder = makeDashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.registerState( "breakfast", _ => [ undefined, undefined, "batgirl" ], o => {
					o.setStuff( "waffles" )
				} )
			
			const made: Array<SomeClass> = factory
				.times( 3 )
				.applyState( "breakfast" )
				.make( _ => [ "alfred" ] )
			
			made.forEach( item => {
				expect( item.param1 ).toBe( "alfred" )
				expect( item.param2 ).toBe( "robin" )
				expect( item.getStuff() ).toBe( "waffles" )
			} )
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
						.define( SomeClass, _ => [] )
					
					factory.registerState( "withgenerator", generator => [
						generator.someNumber(),
						generator.someString(),
					] )
					
					const made: SomeClass = factory
						.applyState( "withgenerator" )
						.make()
					
					expect( made.param1 ).toBe( GENERATOR.someNumber() )
					expect( made.param2 ).toBe( GENERATOR.someString() )
				} ) )
			
			describe( `Overrides`, () =>
				it( `Should provide the generator to the seed function`, () => {
					
					const factory: Builder = makeDashing( GENERATOR )
						.define( SomeClass, _ => [] )
					
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
							_ => [],
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
						.define( SomeClass, _ => [] )
					
					factory.registerState( "breakfast", _ => [],
						( instance: SomeClass, generator ) => {
							instance.setStuff( generator.someString() )
						},
					)
					
					const made: SomeClass = factory
						.applyState( "breakfast" )
						.make()
					
					
					expect( made.getStuff() ).toBe( GENERATOR.someString() )
				} ) )
		} )
	} )
} )
