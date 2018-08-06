import { mobjectsDataGenerator } from "../Factory.spec"




export type paramsFactory = ( faker: mobjectsDataGenerator ) => Array<any>

export interface Seed
{
	generate(): Array<any>
	merge(seed: Seed): Seed
}

export abstract class AbstractSeed implements Seed {
	
	abstract generate(): any[] 
	
	merge(seed: Seed): Seed {
		throw new Error("Method not implemented.");
	}
}