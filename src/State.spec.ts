import { InstanceCompositeState, InstanceState } from "./State"




describe( `CompositeState`, () => {
	
	describe( `No states passed on creation`, () => {
		it( `Should return a blank seed`, () => {
			
			const composite = new InstanceCompositeState()
			
			expect( composite.seed( {} ) ).toEqual( [] )
		} )
		
		it( `Should return instance after callback`, () => {

			const composite = new InstanceCompositeState()
			
			expect( composite.onCreated( "instance", {} ) ).toBe( "instance" )
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
				
				const firstState  = new InstanceState( _ => [ "waffles", "pancakes" ] ),
				      secondState = new InstanceState( _ => [ undefined, "syrup" ] )
				
				const composite = new InstanceCompositeState( firstState, secondState )
				
				expect( composite.seed( {} ) ).toEqual( [ "waffles", "syrup" ] )
			} )
			
			it( `Should pass generator to each seed`, () => {
				
				const firstState  = new InstanceState( g => [ g.someString(), "pancakes" ] ),
				      secondState = new InstanceState( g => [ undefined, g.someNumber() ] )
				
				const composite = new InstanceCompositeState( firstState, secondState )
				
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
				
				const result = new InstanceCompositeState( firstState, secondState )
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
				
				const result = new InstanceCompositeState( state )
					.onCreated( instance, {} )
				
				expect( result ).toBe( instance )
			} )
			
			it( `Should return object returned to onCreated if any`, () => {
				
				const firstOncreated = jest.fn().mockImplementation( ( instance, _ ) => "🍩" )
				const secondOncreated = jest.fn().mockImplementation( ( instance, _ ) => "🥞" )
				
				const result = new InstanceCompositeState( new InstanceState( _ => [], firstOncreated ), new InstanceState( _ => [], secondOncreated ) )
					.onCreated( "instance", "generator" )
				
				expect( firstOncreated ).toHaveBeenCalledWith( "instance", "generator" )
				
				expect( secondOncreated ).toHaveBeenCalledWith( "🍩", "generator" )
				
				expect( result ).toBe( "🥞" )
			} )
			
			it( `Should pass generator to each callback`, () => {
				
				const state = new InstanceState( _ => [], ( instance, _ ) => GENERATOR.someString() )
				
				const result = new InstanceCompositeState( state )
					.onCreated( {}, GENERATOR )
				
				expect( result ).toBe( GENERATOR.someString() )
			} )
		} )
		
		describe( `empty()`, () => {
			it( `Should empty the collection`, () => {
				
				const composite = new InstanceCompositeState()
				
				
				
			} )
		} )
		
		describe( `add()`, () => {
			it( `Should add passed state to composite `, () => {
			
			} )
		} )
	} )
	
} )
