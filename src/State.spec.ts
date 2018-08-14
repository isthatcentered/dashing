import { InstanceCompositeState, InstanceState, State } from "./State"
import { onCreatedCallback, seedGenerator } from "./features.spec"




describe( `CompositeState`, () => {
	
	describe( `No states passed on creation`, () => {
		it( `Should return a blank seed`, () => {
			
			const composite = new InstanceCompositeState()
			
			expect( composite.makeSeed( {} ) ).toEqual( [] )
		} )
		
		it( `Should return instance after callback`, () => {
			
			const composite = new InstanceCompositeState()
			
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
				
				const composite = new InstanceCompositeState( firstState, secondState )
				
				expect( composite.makeSeed( {} ) ).toEqual( [ "waffles", "syrup" ] )
			} )
			
			it( `Should pass generator to each seed`, () => {
				
				const firstState  = makeState( g => [ g.someString(), "pancakes" ] ),
				      secondState = makeState( g => [ undefined, g.someNumber() ] )
				
				const composite = new InstanceCompositeState( firstState, secondState )
				
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
				
				const result = new InstanceCompositeState( firstState, secondState )
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
				
				const result = new InstanceCompositeState( state )
					.applyOnCreated( instance, {} )
				
				expect( result ).toBe( instance )
			} )
			
			it( `Should return object returned to onCreated if any`, () => {
				
				const firstOncreated = jest.fn().mockImplementation( ( instance, _ ) => "🍩" )
				const secondOncreated = jest.fn().mockImplementation( ( instance, _ ) => "🥞" )
				
				const result = new InstanceCompositeState( makeState( undefined, firstOncreated ), makeState( undefined, secondOncreated ) )
					.applyOnCreated( "instance", "generator" )
				
				expect( firstOncreated ).toHaveBeenCalledWith( "instance", "generator" )
				
				expect( secondOncreated ).toHaveBeenCalledWith( "🍩", "generator" )
				
				expect( result ).toBe( "🥞" )
			} )
			
			it( `Should pass generator to each callback`, () => {
				
				const state = makeState( undefined, ( instance, _ ) => GENERATOR.someString() )
				
				const result = new InstanceCompositeState( state )
					.applyOnCreated( {}, GENERATOR )
				
				expect( result ).toBe( GENERATOR.someString() )
			} )
		} )
		
		describe( `empty()`, () => {
			it( `Should empty the collection`, () => {
				
				const composite = new InstanceCompositeState( makeState( _ => [ "waffles" ] ) )
				
				expect( composite.makeSeed( {} ) ).toEqual( [ "waffles" ] )
				
				composite.empty()
				
				expect( composite.makeSeed( {} ) ).toEqual( [] )
			} )
		} )
		
		describe( `add()`, () => {
			it( `Should add passed state to composite `, () => {
				
				const composite = new InstanceCompositeState(  )
				
				expect( composite.makeSeed( {} ) ).toEqual( [] )
				
				composite.add(makeState( _ => [ "waffles" ] ))
				
				expect( composite.makeSeed( {} ) ).toEqual( [ "waffles" ] )
			} )
		} )
	} )
} )


function makeState( seed?: seedGenerator, callback?: onCreatedCallback ): State
{
	return {
		applyOnCreated: callback || (( i, g ) => undefined),
		makeSeed:       seed || (( g ) => []),
	}
}
