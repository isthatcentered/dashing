import { mobjectsDataGenerator } from "../Factory.spec"




export type paramsFactory = ( faker: mobjectsDataGenerator ) => Array<any>

export interface Seed
{
	generate(): Array<any>
	merge(seed: Seed): Seed
}

export class SeedComponent implements Seed {
	
	generate(): any[] {
		throw new Error("Method generate() not implemented")
	}
	
	merge(seed: Seed): Seed {
		// return new SeedComposite(this, seed)
		return {generate: () => [], merge: () => this}
	}
}