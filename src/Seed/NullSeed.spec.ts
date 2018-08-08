import { AbstractLeadSeed } from "./AbstractLeadSeed"
import { NullSeed } from "./NullSeed"




describe( `NullSeed`, () => {
	
	it( `Should extend AbstractLeafSeed`, () => {
		expect(new NullSeed()).toBeInstanceOf(AbstractLeadSeed)
	} )
} )