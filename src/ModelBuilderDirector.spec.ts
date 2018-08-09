import { ModelBuilder } from "./ClassBuilder"
import { Seed } from "./Seed/Seed"




export class ModelBuilderDirector
{
	private _builder: ModelBuilder<any>
	
	
	constructor( builder: ModelBuilder<any> )
	{
		this._builder = builder
		
	}
	
	
	make( overrides?: Seed, states: string[] = [] ): any
	{
		
		states.forEach( state =>
			this._builder.applyState( state ) )
		
		this._builder.make( overrides )
		
		this.reset()
	}
	
	
	reset(): void
	{
	
	}
}

export class TestableModelBuilderDirector extends ModelBuilderDirector
{
	
	hasBeenReseted: boolean = false
	
	
	reset()
	{
		super.reset()
		this.hasBeenReseted = true
	}
	
}

describe( `ModelBuilderDirector`, () => {
	
	describe( `Instantiation`, () => {
	
	} )
	
	describe( `make()`, () => {
		
		it( `Should reset builder after each make`, () => {
			
			const director = new TestableModelBuilderDirector( makeBuilder() )
			
			director.make()
			
			expect( director.hasBeenReseted ).toBe( true )
		} )
		
		describe( `No overrides`, () =>
			it( `Should call builder's make with no params`, () => {
				
				const builder  = makeBuilder(),
				      director = new ModelBuilderDirector( builder )
				
				director.make()
				
				expect( builder.make ).toHaveBeenCalledWith( undefined )
			} ) )
		
		describe( `Overrides`, () =>
			it( `Should call builder's make with overrides`, () => {
				
				const builder  = makeBuilder(),
				      director = new ModelBuilderDirector( builder )
				
				const overrides = makeOverrides()
				
				director.make( overrides )
				
				expect( builder.make ).toHaveBeenCalledWith( overrides )
			} ) )
		
		describe( `States`, () =>
			it( `Should call builder's applyState() for each supply state`, () => {
				
				const builder  = makeBuilder(),
				      director = new ModelBuilderDirector( builder )
				
				director.make( undefined, [ "battle", "defeated" ] )
				
				expect( builder.applyState ).toHaveBeenCalledTimes( 2 )
				expect( builder.applyState ).toHaveBeenNthCalledWith( 1, "battle" )
				expect( builder.applyState ).toHaveBeenNthCalledWith( 2, "defeated" )
			} ) )
		
		describe( `States & overrides`, () => {
		
		} )
	} )
	
	describe( `registerState()`, () => {
	
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
