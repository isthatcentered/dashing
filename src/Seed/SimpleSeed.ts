import { CompositeSeed } from "./CompositeSeed"
import { Seed } from "./Seed"
import { modelState } from "./Seed"
import { AbstractLeadSeed } from "./AbstractLeadSeed"




export class SimpleSeed extends AbstractLeadSeed implements Seed
{
	
	protected readonly _data!: modelState
	
	
	constructor( data: modelState )
	{
		super()
		
		this._data = [ ...data ]
	}
	
	
	generate(): modelState
	{
		return [ ...this._data ]
	}
	
	
	
}