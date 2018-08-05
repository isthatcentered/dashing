import { mobjectsDataGenerator } from "../Factory.spec"




export type paramsFactory = ( faker: mobjectsDataGenerator ) => Array<any>

export interface Seed
{
	generate(): Array<any>
}

