import { ClassBuilder } from "./ClassBuilder"
import { SimpleSeed } from "./Seed/SimpleSeed"
import { CompositeSeed } from "./Seed/CompositeSeed"




class SomeClass
{
	constructor( public param1: any, public param2: any, public param3: any )
	{
	}
}

describe( `ClassBuilder integration test`, () => {
	
	test( `Building a product with only default seed`, () => {
		
		const created: SomeClass = new ClassBuilder( SomeClass, new SimpleSeed( [
			"batman",
			"robin",
			"alfred",
		] ) )
			.make()
		
		expect( created.param1 ).toBe( "batman" )
		expect( created.param2 ).toBe( "robin" )
		expect( created.param3 ).toBe( "alfred" )
	} )
	
	test( `Building a product with overrides`, () => {
		
		const created: SomeClass = new ClassBuilder( SomeClass, new SimpleSeed( [
			"batman",
			"robin",
			"alfred",
		] ) )
			.make( new SimpleSeed( [ undefined, "joker", "two-face" ] ) )
		
		expect( created.param1 ).toBe( "batman" )
		expect( created.param2 ).toBe( "joker" )
		expect( created.param3 ).toBe( "two-face" )
	} )
	
	test( `Building a product with states`, () => {
		
		const created: SomeClass = new ClassBuilder( SomeClass, new SimpleSeed( [
			"batman",
			"robin",
			"alfred",
		] ) )
			.registerState( "defeated", new SimpleSeed( [ "KO batman", "KO robin" ] ) )
			.applyState( "defeated" )
			.make()
		
		expect( created.param1 ).toBe( "KO batman" )
		expect( created.param2 ).toBe( "KO robin" )
		expect( created.param3 ).toBe( "alfred" )
	} )
	
	test( `Building a product with overrides & states`, () => {
		
		const created: SomeClass = new ClassBuilder( SomeClass, new SimpleSeed( [
			"batman",
			"robin",
			"alfred",
		] ) )
			.registerState( "defeated", new SimpleSeed( [ undefined, "KO robin" ] ) )
			.applyState( "defeated" )
			.make( new SimpleSeed( [ undefined, "joker", "scarecrow" ] ) )
		
		expect( created.param1 ).toBe( "batman" )
		expect( created.param2 ).toBe( "KO robin" )
		expect( created.param3 ).toBe( "scarecrow" )
	} )
} )
