import { merge } from "lodash"




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


export type seedGenerator = ( generator ) => any[]

export type onCreatedCallback = ( instance: any, generator: any ) => any | void


interface FactorySlice
{
	model: Function,
	factory: Factory,
}

class Factory
{
	private _generator: any
	private _model: Function
	private _seed: seedGenerator
	private _states: { [ name: string ]: { seed: seedGenerator, onCreated: onCreatedCallback } } = {}
	private _activatedStates: Array<{ seed: seedGenerator, onCreated: onCreatedCallback }> = []
	private _onCreated: onCreatedCallback
	private _times: number = 1
	
	
	constructor( generator: any, model: Function, seed: seedGenerator, onCreated?: onCreatedCallback )
	{
		this._model = model
		this._seed = seed
		this._onCreated = onCreated || (( object ) => object)
		this._generator = generator
	}
	
	
	make( overrides: seedGenerator = _ => [] ): any
	{
		let made: any[] = []
		
		for ( let i = 0; i < this._times; i++ ) {
			
			let defaultState = this._seed( this._generator )
			
			let state = [
				...this._activatedStates.map( s => s.seed ),
				overrides,
			]
				.reduce(
					( state, seed ) => merge( state, seed( this._generator ) ),
					defaultState,
				)
			
			let instance = new (this._model as any)( ...state )
			
			let afterCallbacks = this._activatedStates
				.reduce(
					( instance, state ) =>
						state.onCreated( instance, this._generator ) || instance,
					this._onCreated( instance, this._generator ) || instance,
				)
			
			made.push( afterCallbacks )
		}
		
		this.reset()
		
		return made.length > 1 ?
		       made :
		       made.pop()
	}
	
	
	registerState( stateName: string, seed: seedGenerator, onCreated?: onCreatedCallback ): this
	{
		this._states[ stateName ] = { seed, onCreated: onCreated || (() => undefined) }
		
		return this
	}
	
	
	applyState( ...states: Array<string> )
	{
		states.forEach( stateName =>
			this._activatedStates.push( this._getState( stateName ) ) )
		
		return this
	}
	
	
	reset()
	{
		this._activatedStates = []
		this._times = 1
	}
	
	
	times( number: number ): this
	{
		this._times = number > 0 ?
		              number :
		              1 // @todo: unit test for this
		
		return this
	}
	
	
	private _getState( stateName: string )
	{
		const state = this._states[ stateName ]
		
		if ( !state )
			throw new Error( `No state registered under name ${stateName}` )
		
		return state
	}
}

export class Dashing
{
	
	protected _factories: Array<FactorySlice> = []
	private _generator: any = {}
	
	
	
	constructor( _generator: any )
	{
		this._generator = _generator
	}
	
	
	define( model: Function, seed: seedGenerator, onCreated?: onCreatedCallback ): Factory
	{
		
		const factory = new Factory( this._generator, model, seed, onCreated )
		
		this._factories.push( { model, factory } )
		
		return factory
	}
	
	
	getFactory( model: Function )
	{
		return this._getFactorySlice( model ).factory
	}
	
	
	private _getFactorySlice( model ): FactorySlice
	{
		const slice = this._factories
			.filter( fs => fs.model === model )
			.pop()
		
		if ( !slice )
			throw new Error( `No registered factory for model ${model}` )
		
		return slice
	}
}


function makeDashing( generator = {} )
{
	return new Dashing( generator )
}


describe( `Dashing`, () => {
	
	describe( `Making an item`, () => {
		
		describe( `Default setup at creation`, () => {
			
			it( `Should apply given defaults as instance's constructor params`, () => {
				
				const made: SomeClass = makeDashing()
					.define( SomeClass, _ => [ "batman", "robin" ] )
					.make()
				
				
				expect( made.param1 ).toBe( "batman" )
				expect( made.param2 ).toBe( "robin" )
			} )
		} )
		
		describe( `Apllying states`, () => {
			
			it( `Should return model constructed with state override`, () => {
				
				const factory: Factory = makeDashing()
					.define( SomeClass, _ => [ "batman", "robin" ] )
					.registerState( "defeated", _ => [ undefined, "joker" ] )
				
				const made: SomeClass = factory
					.applyState( "defeated" )
					.make()
				
				expect( made.param1 ).toBe( "batman" )
				expect( made.param2 ).toBe( "joker" )
			} )
			
			it( `Should override default state in order of applyance`, () => {
				
				const factory: Factory = makeDashing()
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
				
				const factory: Factory = makeDashing()
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
					
					const factory: Factory = makeDashing()
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
					
					const factory: Factory = makeDashing()
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
		
		describe( `Applying overrides`, () =>
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
				
				const factory: Factory = makeDashing()
					.define( SomeClass, _ => [] )
				
				const made: Array<SomeClass> = factory
					.times( 3 )
					.make()
				
				expect( made.length ).toBe( 3 )
				
				made.forEach( m => expect( m ).toBeInstanceOf( SomeClass ) )
			} )
			
			it( `Should reset the "times" count after make for next object`, () => {
				
				const factory: Factory = makeDashing()
					.define( SomeClass, _ => [] )
				
				factory.times( 3 )
				
				const first: Array<SomeClass> = factory
					.make()
				
				const second = factory.make()
				
				expect( first.length ).toBe( 3 )
				expect( second ).toBeInstanceOf( SomeClass )
			} )
			
			it( `Should still apply defaults, overrides, and callbacks to each one`, () => {
				
				const factory: Factory = makeDashing()
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
		
		describe( `Using the generator for dynamic data`, () => {
			
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
						
						const factory: Factory = makeDashing( GENERATOR )
							.define( SomeClass, generator => [ generator.someNumber(), generator.someString() ] )
						
						const made: SomeClass = factory
							.make()
						
						expect( made.param1 ).toBe( GENERATOR.someNumber() )
						expect( made.param2 ).toBe( GENERATOR.someString() )
					} ) )
				
				describe( `State`, () =>
					it( `Should provide the generator to the seed function`, () => {
						
						const factory: Factory = makeDashing( GENERATOR )
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
						
						const factory: Factory = makeDashing( GENERATOR )
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
						
						const factory: Factory = makeDashing( GENERATOR )
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
						
						const factory: Factory = makeDashing( GENERATOR )
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
	
	
	
	// @todo: Should errors throw to break process or this is not what we want
	// @todo: calling unregistered state
	// @todo: normalizing state name
	// @todo: call reset() after make
	// @todo: other hooks ?
} )