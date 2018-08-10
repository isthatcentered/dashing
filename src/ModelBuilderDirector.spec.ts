import { ModelBuilder } from "./ClassBuilder"
import { Seed } from "./Seed/Seed"
import { ClassModelBuilderDirector } from "./ModelBuilderDirector"
import Mock = jest.Mock




export class TestableModelBuilderDirector extends ClassModelBuilderDirector<any>
{

}

describe( `ModelBuilderDirector`, () => {
	
	describe( `make()`, () => {
		
		describe( `Should return the result of builder's make`, () => {
			
			const builder = makeBuilder();
			
			(builder.make as Mock).mockReturnValue( "batman" )
			
			const director = new TestableModelBuilderDirector( builder )
			
			expect( director.make() ).toBe( "batman" )
		} )
		
		
		describe( `No overrides`, () =>
			it( `Should call builder's make with no params`, () => {
				
				const builder  = makeBuilder(),
				      director = new TestableModelBuilderDirector( builder )
				
				director.make()
				
				expect( builder.make ).toHaveBeenCalledWith( undefined )
			} ) )
		
		describe( `Overrides`, () =>
			it( `Should call builder's make with overrides`, () => {
				
				const builder  = makeBuilder(),
				      director = new TestableModelBuilderDirector( builder )
				
				const overrides = makeOverrides()
				
				director.make( overrides )
				
				expect( builder.make ).toHaveBeenCalledWith( overrides )
			} ) )
		
		describe( `States`, () =>
			it( `Should call builder's applyState() for each supply state`, () => {
				
				const builder  = makeBuilder(),
				      director = new TestableModelBuilderDirector( builder )
				
				director.make( undefined, [ "battle", "defeated" ] )
				
				expect( builder.applyState ).toHaveBeenCalledTimes( 2 )
				expect( builder.applyState ).toHaveBeenNthCalledWith( 1, "battle" )
				expect( builder.applyState ).toHaveBeenNthCalledWith( 2, "defeated" )
			} ) )
		
		describe( `States & overrides`, () => {
			
			const builder   = makeBuilder(),
			      overrides = makeOverrides( [ "batman" ] ),
			      director  = new TestableModelBuilderDirector( builder )
			
			director.make( overrides, [ "battle", "defeated" ] )
			
			expect( builder.applyState ).toHaveBeenCalledTimes( 2 )
			expect( builder.make ).toHaveBeenCalledWith( overrides )
		} )
	} )
	
	describe( `registerState()`, () => {
		it( `Should call builder's register state method`, () => {
			
			const builder     = makeBuilder(),
			      stateParams = makeOverrides()
			
			const director = new TestableModelBuilderDirector( builder )
			
			director.registerState( "STATENAME", stateParams )
			
			expect( builder.registerState ).toHaveBeenCalledWith( "STATENAME", stateParams )
		} )
		
		it( `Should be fluent`, () => {
			
			const director = new TestableModelBuilderDirector( makeBuilder() )
			
			expect( director.registerState( "STATENAME", makeOverrides() ) ).toBe( director )
			
		} )
	} )
} )



function makeOverrides( overrides: any = [ "batman", "robin" ] ): Seed
{
	// I do not care at all about what is being passed into make
	// so i do not have to mimic the true format of a Seed object
	return overrides as any
}


function makeBuilder(): ModelBuilder<any>
{
	return {
		applyState:    jest.fn(),
		make:          jest.fn(),
		registerState: jest.fn(),
	}
}
