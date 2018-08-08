import { modelState, Seed } from "./Seed"
import { CompositeSeed } from "./CompositeSeed"




export abstract class AbstractLeadSeed implements Seed{
	
	abstract generate()
	
	
	merge( seed: Seed )
	{
		return new CompositeSeed([this, seed])
	}
	
}