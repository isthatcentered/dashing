import { CompositeState, InstanceState } from "./State"




describe( `CompositeState`, () => {
	
	
	
	describe( `When passed a number of states`, () => {
		
		let GENERATOR
		beforeEach( () =>
			GENERATOR = {
				someString: () => "hello",
				someNumber: () => 4,
				
			} )
		
		describe( `Seed`, () => {
			it( `Should trigger each contained seed in the order they were passed in`, () => {
				
				const firstState  = new InstanceState( _ => [ "waffles", "pancakes" ] ),
				      secondState = new InstanceState( _ => [ undefined, "syrup" ] )
				
				const composite = new CompositeState( firstState, secondState )
				
				expect( composite.seed( {} ) ).toEqual( [ "waffles", "syrup" ] )
			} )
			
			it( `Should pass generator to each seed`, () => {
				
				const firstState  = new InstanceState( g => [ g.someString(), "pancakes" ] ),
				      secondState = new InstanceState( g => [ undefined, g.someNumber() ] )
				
				const composite = new CompositeState( firstState, secondState )
				
				expect( composite.seed( GENERATOR ) ).toEqual( [ GENERATOR.someString(), GENERATOR.someNumber() ] )
			} )
		} )
		
		describe( `onCreated callback`, () => {
			it( `Should apply each callback to instance in the order they were passed in`, () => {
				
				const instance = { setBreakfast: jest.fn() }
				
				const firstState  = new InstanceState( _ => [], ( instance, _ ) => {
					      instance.setBreakfast( "🍩" )
				      } ),
				      secondState = new InstanceState( _ => [], ( instance, _ ) => {
					      instance.setBreakfast( "🥞" )
				      } )
				
				const result = new CompositeState( firstState, secondState )
					.onCreated( instance, {} )
				
				expect( instance.setBreakfast ).toHaveBeenCalledTimes( 2 )
				expect( instance.setBreakfast ).toHaveBeenNthCalledWith( 1, "🍩" )
				expect( instance.setBreakfast ).toHaveBeenNthCalledWith( 2, "🥞" )
			} )
			
			it( `Should return the mutated instance if nothing returned to onCreated function`, () => {
				
				const instance = { setBreakfast: jest.fn() }
				
				const state = new InstanceState( _ => [], ( instance, _ ) => {
					instance.setBreakfast( "waffles" )
				} )
				
				const result = new CompositeState( state )
					.onCreated( instance, {} )
				
				expect( result ).toBe( instance )
			} )
			
			it( `Should return object returned to onCreated if any`, () => {
				
				const instance = { setBreakfast: jest.fn() }
				
				const state = new InstanceState( _ => [], ( instance, _ ) => "😅" )
				
				const result = new CompositeState( state )
					.onCreated( instance, {} )
				
				expect( result ).toBe( "😅" )
			} )
			
			it( `Should pass generator to each callback`, () => {
				
				const state = new InstanceState( _ => [], ( instance, _ ) => GENERATOR.someString() )
				
				const result = new CompositeState( state )
					.onCreated( {}, GENERATOR )
				
				expect( result ).toBe( GENERATOR.someString() )
			} )
		} )
		
	} )
	
} )
