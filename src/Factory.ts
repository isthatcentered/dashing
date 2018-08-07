import { NullStateSeed, Seed } from "./Seed/Seed.spec"




export interface ModelBuilder<T>
{
	
	registerState( state: string, overrides: Seed ): this
	
	applyState( state: string ): this
	
	make(): T
}

export class ClassBuilder implements ModelBuilder<any>
{
	protected readonly _seed: Seed
	protected readonly _ref: Function
	protected _states: { [ state: string ]: Seed } = {}
	protected _state: Seed = new NullStateSeed()
	
	
	constructor( ref: Function, seed: Seed )
	{
		this._ref = ref
		this._seed = seed
	}
	
	
	make( overrides: Seed = new NullStateSeed() )
	{
		const params = this._seed
			.merge( overrides )
			.merge( this._state )
			.generate()
		
		this.reset()
		
		return new (this._ref as any)( ...params )
	}
	
	
	applyState( state: string ): this
	{
		if ( !this._hasState( state ) )
			throw new Error( `No state ${state} registered.` )
		
		this._state.merge( this._getState( state ) )
		
		return this
	}
	
	
	registerState( state: string, overrides: Seed ): this
	{
		if ( this._hasState( state ) )
			throw new Error( "Cannot register a state twice" )
		
		this._states[ state ] = overrides
		
		return this
	}
	
	
	reset(): void
	{
		this._state = new NullStateSeed()
	}
	
	
	private _hasState( state: string ): boolean
	{
		return this._getState( state ) !== undefined
	}
	
	
	private _getState( state: string ): Seed
	{
		return this._states[ state ]
	}
}