import { CompositeModelPreset, Preset } from "../Preset"
import { dashingCallback, modelParameters } from "../Dashing"




describe( `CompositeState`, () => {
	
	describe( `No states passed on creation`, () => {
		it( `Should return a blank seed`, () => {
			
			const composite = new CompositeModelPreset()
			
			expect( composite.makeSeed( {} ) ).toEqual( [] )
		} )
		
		it( `Should return instance after callback`, () => {
			
			const composite = new CompositeModelPreset()
			
			expect( composite.applyOnCreated( "instance", {} ) ).toBe( "instance" )
		} )
	} )
	
	describe( `When passed a number of states`, () => {
		
		let GENERATOR
		beforeEach( () =>
			GENERATOR = {
				someString: () => "hello",
				someNumber: () => 4,
				
			} )
		
		describe( `Seed`, () => {
			it( `Should trigger each contained seed in the order they were passed in`, () => {
				
				const firstState  = makeState( _ => [ "waffles", "pancakes" ] ),
				      secondState = makeState( _ => [ undefined, "syrup" ] )
				
				const composite = new CompositeModelPreset( firstState, secondState )
				
				expect( composite.makeSeed( {} ) ).toEqual( [ "waffles", "syrup" ] )
			} )
			
			it( `Should pass generator to each seed`, () => {
				
				const firstState  = makeState( g => [ g.someString(), "pancakes" ] ),
				      secondState = makeState( g => [ undefined, g.someNumber() ] )
				
				const composite = new CompositeModelPreset( firstState, secondState )
				
				expect( composite.makeSeed( GENERATOR ) ).toEqual( [ GENERATOR.someString(), GENERATOR.someNumber() ] )
			} )
		} )
		
		describe( `onCreated callback`, () => {
			it( `Should apply each callback to instance in the order they were passed in`, () => {
				
				const instance = { setBreakfast: jest.fn() }
				
				const firstState  = makeState( undefined, ( instance, _ ) => {
					      instance.setBreakfast( "🍩" )
				      } ),
				      secondState = makeState( undefined, ( instance, _ ) => {
					      instance.setBreakfast( "🥞" )
				      } )
				
				const result = new CompositeModelPreset( firstState, secondState )
					.applyOnCreated( instance, {} )
				
				expect( instance.setBreakfast ).toHaveBeenCalledTimes( 2 )
				expect( instance.setBreakfast ).toHaveBeenNthCalledWith( 1, "🍩" )
				expect( instance.setBreakfast ).toHaveBeenNthCalledWith( 2, "🥞" )
			} )
			
			it( `Should return the mutated instance if nothing returned to onCreated function`, () => {
				
				const instance = { setBreakfast: jest.fn() }
				
				const state = makeState( undefined, ( instance, _ ) => {
					instance.setBreakfast( "waffles" )
				} )
				
				const result = new CompositeModelPreset( state )
					.applyOnCreated( instance, {} )
				
				expect( result ).toBe( instance )
			} )
			
			it( `Should return object returned to onCreated if any`, () => {
				
				const firstOncreated = jest.fn().mockImplementation( ( instance, _ ) => "🍩" )
				const secondOncreated = jest.fn().mockImplementation( ( instance, _ ) => "🥞" )
				
				const result = new CompositeModelPreset( makeState( undefined, firstOncreated ), makeState( undefined, secondOncreated ) )
					.applyOnCreated( "instance", "generator" )
				
				expect( firstOncreated ).toHaveBeenCalledWith( "instance", "generator" )
				
				expect( secondOncreated ).toHaveBeenCalledWith( "🍩", "generator" )
				
				expect( result ).toBe( "🥞" )
			} )
			
			it( `Should pass generator to each callback`, () => {
				
				const state = makeState( undefined, ( instance, _ ) => GENERATOR.someString() )
				
				const result = new CompositeModelPreset( state )
					.applyOnCreated( {}, GENERATOR )
				
				expect( result ).toBe( GENERATOR.someString() )
			} )
		} )
	} )
} )


function makeState( seed?: any, callback?: dashingCallback ): Preset
{
	return {
		applyOnCreated: callback || (( i, g ) => undefined),
		makeSeed:       seed || (( g ) => []),
	}
}
