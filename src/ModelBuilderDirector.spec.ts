import { ModelBuilder } from "./ClassBuilder"
import { Seed } from "./Seed/Seed"




export class ModelBuilderDirector
{
	private _builder: ModelBuilder<any>
	
	
	constructor( builder: ModelBuilder<any> )
	{
		this._builder = builder
		
	}
	
	
	make( overrides?: Seed, states?: string[] ): any
	{
		const params: any[] = [ overrides, states ].filter( p => p !== undefined )
		
		// @todo: foreach state -> applyState
		
		this._builder.make( overrides )
		
		//@todo: call reset
	}
}

describe( `ModelBuilderDirector`, () => {
	
	describe( `Instantiation`, () => {
	
	} )
	
	describe( `make()`, () => {
		
		it( `Should reset builder after each make`, () => {
			
			expect( true ).toBe( false )
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
		
		xdescribe( `States`, () => {
			it( `Should call builder's applyState() for each supply state`, () => {
				
				const builder  = makeBuilder(),
				      director = new ModelBuilderDirector( builder )
				
				const overrides = makeOverrides(),
				      states    = [ "battle", "defeated" ]
				
				director.make( overrides, states )
				
				expect( builder.applyState ).toHaveBeenCalledTimes( 3 )
			} )
			
			it( `Should throw if state unregistered`, () => {
			
			} )
		} )
		
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
