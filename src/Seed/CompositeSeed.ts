import { Seed } from "./Seed.spec"
import { merge } from "lodash"




export class CompositeSeed implements Seed
{
	protected _items: Array<Seed> = []
	
	
	constructor( seeds?: Array<Seed> )
	{
		if ( seeds && seeds.length )
			seeds.forEach( s => this._items.push( s ) )
	}
	
	
	generate()
	{
		return this._items.length ?
		       this._items
			       .reduce(
				       ( acc: any[], i: Seed ) =>
					       merge( acc, i.generate() ),
				       [],
			       ) :
		       []
	}
	
	
	merge( seed: Seed )
	{
		
		this._items.push( seed )
		
		return this
	}
	
}