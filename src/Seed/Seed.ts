export type modelState = Array<any>

export interface Seed
{
	generate(): modelState
	
	merge( seed: Seed ): Seed
}