import { merge } from "lodash"




class SomeClass
{
	
	
	constructor( public param1, public param2, public param3 )
	{
	}
}


export type seedGenerator = ( generator ) => any[]

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
	private _states: { [ name: string ]: seedGenerator } = {}
	private _activatedStates: Array<seedGenerator> = []
	
	
	constructor( generator: any, model: Function, seed: seedGenerator )
	{
		this._model = model
		this._seed = seed
	}
	
	
	make(): any
	{
		let defaultState = this._seed( this._generator )
		
		let state = this._activatedStates.reduce( ( refinedState, state ) => merge(
			refinedState,
			state( this._generator ),
		), defaultState )
		
		return new (this._model as any)( ...state )
	}
	
	
	registerState( stateName: string, seed: seedGenerator ): this
	{
		this._states[ stateName ] = seed
		
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
	
	
	define( model: Function, seed: seedGenerator ): Factory
	{
		
		const factory = new Factory( {}, model, seed )
		
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
			
			const made = new Dashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.make()
			
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "robin" )
		} )
	} )
	
	describe( `Defining a factory state`, () => {
		
		it( `Should return model constructed with state override`, () => {
			
			const made = new Dashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.registerState( "defeated", _ => [ undefined, "joker" ] )
				.applyState( "defeated" )
				.make()
			
			expect( made.param1 ).toBe( "batman" )
			expect( made.param2 ).toBe( "joker" )
		} )
		
		describe( `Multiple states`, () => {
			
			it( `Should override default state in order of applyance`, () => {
				
				const made = new Dashing()
					.define( SomeClass, _ => [ "batman", "robin" ] )
					.registerState( "defeated", _ => [ undefined, "joker" ] )
					.registerState( "takenOver", _ => [ "twoface", "scarecrow" ] )
					.applyState( "defeated" )
					.applyState( "takenOver" )
					.make()
				
				expect( made.param1 ).toBe( "twoface" )
				expect( made.param2 ).toBe( "scarecrow" )
			} )
		} )
		
		describe( `Alternate way of applying multiple states`, () => {
			const made = new Dashing()
				.define( SomeClass, _ => [ "batman", "robin" ] )
				.registerState( "defeated", _ => [ undefined, "joker" ] )
				.registerState( "takenOver", _ => [ "twoface", "scarecrow" ] )
				.applyState( "defeated", "takenOver" )
				.make()
			
			expect( made.param1 ).toBe( "twoface" )
			expect( made.param2 ).toBe( "scarecrow" )
		} )
		xdescribe( `Normalizing state name`, () => {
		
		} )
	} )
	
	describe( `Defining an onCreated callback`, () => {
		
		describe( `On defaults`, () => {
		
		} )
		
		describe( `On a single state`, () => {
		
		} )
	} )
	
	
	describe( `Using a factory`, () => {
		
		describe( `Creating the default model`, () => {
			// getting the factory
		} )
		
		describe( `Overriding default attributes`, () => {
		
		} )
		
		describe( `Overriding on created ??`, () => {
		
		} )
		
		describe( `Creating a model with state`, () => {
		
		} )
	} )
} )