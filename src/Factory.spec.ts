import { Fakery } from "./index.spec"




class Seed
{
	
	private __seed: Fakery
	
	
	constructor( faker: any, seed: Fakery )
	{
		if ( !Seed.isValid( seed ) )
			throw new Error( `Seed must either be Array or Function returning Array.` )
		
		this.__seed = seed
	}
	
	
	static isValid( seed: Fakery ): boolean
	{
		if ( typeof seed !== "function" && !Array.isArray( seed ) )
			return false
		
		if ( typeof seed === "function" && !Array.isArray( seed() ) )
			return false
		
		return true
	}
	
	
	generate(): Array<any>
	{
		return Array.isArray( this.__seed ) ?
		       [ ...this.__seed ] :
		       this.__seed()
	}
}

export class Factory
{
	private __ref: Function
	private __seed: Seed
	
	
	constructor( use: Function, seed: Seed )
	{
		if ( typeof use !== "function" )
			throw new Error( `Please provide the class you want to be instantiated by mo'bjects\nEx: define(User, f => {)` )
		
		this.__ref = use
		
		this.__seed = seed
	}
	
	
	make( overrides: Array<any> = [] )
	{
		return new (this.__ref as any)( ...this.__seed.generate() )
	}
}


class RandomClassForTests
{
	
	constructor( public param1: any, public param2: any, public param3: any )
	{
	}
}


describe( `Factory`, () => {
	
	describe( `Creating a factory `, () => {
		
		it( `Should throw if passing anything but class ref for "use" parameter`, () => {
			
			const invalids = [ "string", 1, {} ]
			
			invalids.forEach( invalid =>
				expect( () => makeFactory( invalid as any ) ).toThrow() )
		} )
		
		describe( `make()`, () => {
			
			it( `Should create an actual instance of the desired object`, () => {
				
				let created = makeFactory( RandomClassForTests )
					.make()
				
				expect( created ).toBeInstanceOf( RandomClassForTests )
			} )
			
			describe( `Providing defaults`, () =>
				it( `Should instantiate new class with seed result`, () => {
					
					let seed           = makeSeed(),
					    fakeClassRef   = jest.fn(),
					    fakeSeedResult = "batman"
					
					seed.generate = () => [ fakeSeedResult ]
					
					const created: RandomClassForTests = makeFactory(
						fakeClassRef,
						seed,
					).make()
					
					expect( fakeClassRef ).toHaveBeenCalledWith( fakeSeedResult )
				} ) )
		} )
		
		describe( `Overriding defaults`, () => {
		
		} )
	} )
	
	
	
	describe( `Multiple default states`, () => {
	
	} )
} )


describe( `Seed`, () => {
	
	describe( `Creating a seed`, () => {
		
		it( `Should throw if seed neither array nore function`, () => {
			
			const invalids = [ "string", 0, {} ]
			
			invalids.forEach( ( invalid: any ) =>
				expect( () => makeSeed( invalid ) ).toThrow() )
		} )
		
		it( `Should throw if seed is function but doesn't return array`, () => {
			expect( () => makeSeed( () => ({}) ) ).toThrow()
		} )
	} )
	
	describe( `Generate()`, () => {
		
		describe( `Seed as array`, () => {
			
			it( `Should return passed array`, () => {
				
				let params = [ "hello", "world" ]
				
				// immutability check
				expect( makeSeed( params ).generate() ).not.toBe( params )
				
				expect( makeSeed( params ).generate() ).toEqual( params )
			} )
		} )
		
		describe( `Seed as function`, () => {
			
			it( `Should return result of function`, () => {
				
				let param = () => [ "hello", "world" ]
				
				expect( makeSeed( param ).generate() ).toEqual( param() )
			} )
		} )
		
		
		describe( `Generating data automatically`, () => {
			
			makeSeed( faker => {
				return [ faker.randomNumber() ]
			} )
		} )
	} )
} )


function makeSeed( params: Fakery = [] ): Seed
{
	return new Seed( {}, params )
}


function makeFactory( use: Function, seed: Seed = makeSeed() )
{
	return new Factory( use, seed )
}