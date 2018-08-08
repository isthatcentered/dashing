import { Seed } from "./Seed"
import { AbstractLeadSeed } from "./AbstractLeadSeed"




export class NullSeed extends AbstractLeadSeed implements Seed
{
	generate()
	{
		return []
	}
}