import { BuilderBuildConfig } from "./BuildConfig"




describe( `BuildConfig`, () => {
	
	describe( `Instantiation`, () => {
		it( `Should require a default step`, () => {
			// @ts-ignore
			expect( () => new BuilderBuildConfig() ).toThrow()
		} )
		
		it( `Should automatically add defaultStep to steps`, () => {
			
			const builderConfig = new BuilderBuildConfig( "state object here" as any )
			
			expect( builderConfig.getSteps().pop() ).toBe( "state object here" )
		} )
	} )
	
	describe( `setTimes`, () => {
		
		it( `Should set number of instances to be created`, () => {
			
			let builderConfig = new BuilderBuildConfig( {} as any )
			
			builderConfig.setTimes( 8 )
			
			expect( builderConfig.getTimes() ).toBe( 8 )
		} )
		
		it( `Should never go under 1`, () => {
			
			let builderConfig = new BuilderBuildConfig( {} as any )
			
			builderConfig.setTimes( 0 )
			
			expect( builderConfig.getTimes() ).toBe( 1 )
			
			builderConfig.setTimes( -1 )
			
			expect( builderConfig.getTimes() ).toBe( 1 )
		} )
	} )
	
	describe( `addStep()`, () => {
		it( `Should add passed step to steps`, () => {
			
			const builderConfig = new BuilderBuildConfig( "🙌" as any )
			
			builderConfig.addStep( "🍩" as any )
			
			expect( builderConfig.getSteps() ).toEqual( [ "🙌", "🍩" ] )
		} )
	} )
	
	describe( `reset()`, () => {
		it( `Should reset builder time and steps to 1 and defaultStep`, () => {
			
			const builderConfig = new BuilderBuildConfig( "🙌" as any )
			
			builderConfig.addStep( "🍩" as any )
			builderConfig.setTimes( 8 )
			
			expect( builderConfig.getTimes() ).toBe( 8 )
			expect( builderConfig.getSteps() ).toEqual( [ "🙌", "🍩" ] )
			
			builderConfig.reset()
			
			expect( builderConfig.getTimes() ).toBe( 1 )
			expect( builderConfig.getSteps() ).toEqual( [ "🙌" ] )
		} )
	} )
} )