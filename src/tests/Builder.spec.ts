
import { ModelBuilder } from "../Builder"




describe( `ModelBuilder`, () => {
	
	describe( `Instantiation`, () => {
	
	} )
	
	describe( `make()`, () => {
	
	} )
	
	describe( `registerState()`, () => {
		it( `Sould work with wierd state names`, () => {
			
			const stateSeed = jest.fn()
			
			const builder = new ModelBuilder({}, jest.fn(), _ => [])
			
			builder.registerPreset("state with a space", stateSeed)
			
			builder.preset("state with a space")
				.make()
			
			expect(stateSeed).toHaveBeenCalled()
		} )
	} )
	
	describe( `applyState()`, () => {
	
	} )
} )