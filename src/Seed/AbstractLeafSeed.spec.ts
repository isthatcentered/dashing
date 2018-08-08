import { CompositeSeed } from "./CompositeSeed"
import { AbstractLeadSeed } from "./AbstractLeadSeed"
import { Seed } from "./Seed"


jest.mock( "./CompositeSeed" )


class TestableAbstractLeadSeed extends AbstractLeadSeed
{
	generate()
	{
		return []
	}
}

describe( `merge()`, () => {
	
	beforeEach( () => {
		(CompositeSeed as any).mockReset()
	} )
	
	it( `Should return a composite seed with current and merged in data`, () => {
		
		const seed      = new TestableAbstractLeadSeed(),
		      otherSeed = jest.fn() as any
		
		const composite = seed.merge( otherSeed )
		
		expect( composite ).toBeInstanceOf( CompositeSeed )
		
		expect( CompositeSeed ).toHaveBeenCalledWith( [ seed, otherSeed ] )
	} )
} )
