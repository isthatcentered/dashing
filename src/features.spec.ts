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

export type onCreatedCallback = ( object: any ) => any | void


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
	
	
	constructor( generator: any, model: Function, seed: seedGenerator, onCreated?: onCreatedCallback )
	{
		this._model = model
		this._seed = seed
		this._onCreated = onCreated || (( object ) => object)
	}
	
	
	make(): any
	{
		let defaultState = this._seed( this._generator )
		
		let state = this._activatedStates.reduce( ( refinedState, state ) => merge(
			refinedState,
			state.seed( this._generator ),
		), defaultState )
		
		let instance = new (this._model as any)( ...state )
		
		let afterCallbacks = this._activatedStates
			.reduce(
				( instance, state ) =>
					state.onCreated( instance ) || instance,
				this._onCreated( instance ) || instance,
			)
		
		return afterCallbacks
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
	
	
	define( model: Function, seed: seedGenerator, onCreated?: onCreatedCallback ): Factory
	{
		
		const factory = new Factory( {}, model, seed, onCreated )
		
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

describe( `Dashing`, () => {
	
	
	describe( `Defining a factory with defaults`, () => {
		
		it( `Should return a model constructed with defaults as constructor params`, () => {
			
			const made: SomeClass = new Dashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.make()
			
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "robin" )
		} )
	} )
	
	describe( `Defining a factory state`, () => {
		
		it( `Should return model constructed with state override`, () => {
			
			const made: SomeClass = new Dashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.registerState( "defeated", _ => [ undefined, "joker" ] )
				.applyState( "defeated" )
				.make()
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "joker" )
		} )
		
		describe( `Multiple states`, () => {
			
			it( `Should override default state in order of applyance`, () => {
				
				const made: SomeClass = new Dashing()
					.define( SomeClass, _ => [ "batman", "robin" ] )
					.registerState( "defeated", _ => [ undefined, "joker" ] )
					.registerState( "takenOver", _ => [ "twoface", "scarecrow" ] )
					.applyState( "defeated" )
					.applyState( "takenOver" )
					.make()
				
				expect( made.param1 ).toBe( "twoface" )
				expect( made.param2 ).toBe( "scarecrow" )
			} )
			
			// @todo: this belongs to unit test
			describe( `Applying multiple states at once`, () => {
				
				const made = new Dashing()
					.define( SomeClass, _ => [ "batman", "robin" ] )
					.registerState( "defeated", _ => [ undefined, "joker" ] )
					.registerState( "takenOver", _ => [ "twoface", "scarecrow" ] )
					.applyState( "defeated", "takenOver" )
					.make()
				
				expect( made.param1 ).toBe( "twoface" )
				expect( made.param2 ).toBe( "scarecrow" )
			} )
		} )
		
		// @todo: this test
		xdescribe( `Normalizing state name`, () => {
		
		} )
	} )
	
	describe( `Defining an onCreated callback`, () => {
		
		describe( `For every object created by this factory`, () => {
			
			it( `Should apply onCreated callback to newly created instance`, () => {
				
				// @todo: add test for that, either return instance if immutable, or we return mutated instance
				const onCreatedCallback = jest.fn().mockImplementation( made => {
					made.setStuff( "alfred" )
				} )
				
				const made: SomeClass = new Dashing()
					.define( SomeClass, _ => [], onCreatedCallback )
					.make()
				
				expect( onCreatedCallback ).toHaveBeenCalledWith( made )
				
				expect( made ).toBeInstanceOf( SomeClass )
				
				expect( made.getStuff() ).toBe( "alfred" )
			} )
		} )
		
		describe( `For a state`, () => {
			
			it( `Should apply state's oncreated callback on top of default callback`, () => {
				
				const made: SomeClass = new Dashing()
					.define( SomeClass, _ => [], o => {
						o.setStuff( "alfred" )
					} )
					.registerState( "sleeping", () => [], o => {
						o.setStuff( "sleeping alfred" )
					} )
					.applyState( "sleeping" )
					.make()
				
				expect( made.getStuff() ).toBe( "sleeping alfred" )
			} )
			
			it( `Should apply each state's oncreated callback in order of applyance`, () => {
				
				const made: SomeClass = new Dashing()
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
					.applyState( "sleeping" )
					.applyState( "awake" )
					.make()
				
				expect( made.getStuff() ).toBe( "awaken alfred" )
				
				expect.assertions( 3 )
			} )
		} )
		
		// @todo: call reset() after make
		// @todo: calling unregistered state
	} )
	
	describe( `Hooks`, () => {
		// @todo: other hooks ?
	} )
	
	
	describe( `Using a factory`, () => {
		
		// @todo: this is a unit test for factory
		describe( `Calling make should reset the builder `, () => {
		
		} )
		
		describe( `Creating the default model`, () => {
			// getting the factory
		} )
		
		describe( `Overriding default attributes`, () => {
		
		} )
		
		describe( `Overriding on created ??`, () => {
		
		} )
		
		describe( `Creating a model with state`, () => {
		
		} )
		
		describe( `Creating multiple models at one`, () => {
			// factory.times(3).create
		} )
	} )
} )