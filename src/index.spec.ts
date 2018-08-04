import { merge } from "lodash"




export interface UnknownObject
{
	[ name: string ]: any
}

class User
{
	
	constructor( public param1: string, public param2: string, public param3: string )
	{
	}
	
	
	doStuff()
	{
		return "hello"
	}
}

export type Fakery = ( faker: any ) => any | Array<any>

class MoBjects
{
	private __factories: Array<{ ref: Function, seed: Fakery }> = []
	
	private __faker = {
		generateRandomNumber: () => 3,
	}
	
	
	define( use: Function, populate: Fakery ): void
	{
		if ( typeof use !== "function" )
			throw new Error( `Please provide the class you want to be instantiated by mo'bjects\nEx: define(User, f => {)` )
		
		if ( !Array.isArray( populate( this.__faker ) ) )
			throw new Error( `
				Class parameters must be passed as array
				Ex: new Thing(0, {...}, "batman")
				    -> mobjects.define(Thing, f => [ 0, {...}, "batman" ])
			` )
		
		if ( this.__hasFactory( use ) )
			throw new Error( `Trying to register already defined "${(use as any).name}" factory ` )
		
		this.__factories = [
			...this.__factories, {
				ref:  use,
				seed: populate,
			},
		]
	}
	
	
	make( classReference: Function, override: Fakery = _ => undefined ): UnknownObject
	{
		
		const match = this.__factories
			.filter( factoryConfig => factoryConfig.ref === classReference )[ 0 ]
		
		if ( !match )
			throw new Error( `Trying to use unregisered ${(classReference as any).name} factory.\nPlease use mobjects' define() function to create matching factory` )
		
		const seed = this.__mergeSeed( match.seed( this.__faker ), override( this.__faker ) )
		
		return new (classReference as any)( ...seed )
	}
	
	
	private __mergeSeed( seed: any, overrides: any )
	{
		if ( !overrides )
			return seed
		
		return merge( seed, overrides )
	}
	
	
	private __hasFactory( type: Function ): boolean
	{
		return this.__factories
			.some( factoryConfig => factoryConfig.ref === type )
	}
}


// I can instantiate any class with defaults parameters
// I can automatically generate parameters data
// I can generate many objects at once
// I can setup class states generation overrides
// I can override parameters at request


let mobjects: MoBjects
describe( `mobjects`, () => {
	
	beforeEach( () => {
		mobjects = new MoBjects()
	} )
	
	
	describe( `Registering a new factory`, () => {
		
		test( `Registering with something other than reference to class throws`, () => {
			
			const invalids = [ "string", 0, {}, [] ],
			      valid    = User
			
			invalids.forEach( i =>
				// @ts-ignore
				expect( () => defineFactory( mobjects, i ) ).toThrow() )
			
			expect( () => defineFactory( mobjects, valid ) ).not.toThrow()
		} )
		
		test( `Throws if factory already defined`, () => {
			
			defineFactory( mobjects, User )
			
			expect( () => defineFactory( mobjects, User ) ).toThrow()
		} )
		
		test( `Cannot create objects from factories that are not registered`, () => {
			
			class NotRegisteredClass
			{
			
			}
			
			expect( () => mobjects.make( NotRegisteredClass ) ).toThrow()
		} )
		
		test( "Can create instances of objects", () => {
			
			defineFactory( mobjects, User )
			
			expect( mobjects.make( User ) ).toBeInstanceOf( User )
		} )
	} )
	
	describe( `Providing defaults`, () => {
		
		test( `Throws if defaults are not passed as array`, () => {
			
			const invalids = [ "string", 0, {} ]
			
			invalids.forEach( item =>
				expect( () =>
					defineFactory( mobjects, User, _ => item ) )
					.toThrow(),
			)
		} )
		
		test( `Instantiates class with defaults`, () => {
			
			let firstParam  = "batman",
			    secondParam = "waffles"
			
			defineFactory( mobjects, User, _ => [ firstParam, secondParam ] )
			
			let user: User = mobjects.make( User ) as User
			
			expect( user.param1 ).toBe( firstParam )
			expect( user.param2 ).toBe( secondParam )
		} )
	} )
	
	describe( `Overriding defaults on make`, () => {
		
		test( `Overrides only if value !== undefined`, () => {
			
			let secondParameter        = "original second parameter",
			    firstParameterOverride = "overriden first parameter",
			    thirdParameterOverride = "overrident third parameter"
			
			defineFactory( mobjects, User, _ => [
				"original first parameter", secondParameter, "original third parameter",
			] )
			
			let instantiated: User = mobjects.make( User, _ => {
				return [ firstParameterOverride, undefined, thirdParameterOverride ]
			} ) as User
			
			expect( instantiated.param1 ).toBe( firstParameterOverride )
			expect( instantiated.param2 ).toBe( secondParameter )
			expect( instantiated.param3 ).toBe( thirdParameterOverride )
		} )
		
		test( `Works if defaults have more parameters than overrides`, () => {
			
			let firstParameter  = "original first parameter",
			    secondParameter = "original second parameter",
			    thirdParameter  = "original third parameter",
			    override        = "overiden first parameter"
			
			let defaultsWithMoreParametersThanOverrides = [ firstParameter, secondParameter, thirdParameter ]
			let overridesWithLessParametersThanDefaults = [ override ]
			
			defineFactory( mobjects, User, _ => [ ...defaultsWithMoreParametersThanOverrides ] )
			
			let instantiated: User = mobjects.make( User, _ => [ ...overridesWithLessParametersThanDefaults ] ) as User
			
			expect( instantiated.param1 ).toBe( override )
			expect( instantiated.param2 ).toBe( secondParameter )
			expect( instantiated.param3 ).toBe( thirdParameter )
		} )
		
		test( `Works if overrides have more parameters than defaults`, () => {
			
			let firstParameter = "original first parameter",
			    secondOverride = "overiden first parameter",
			    thirdOverride  = "overiden first parameter"
			
			let defaultsWithLessParametersThanOverrides = [ firstParameter ]
			let overridesWithMoreParametersThanDefaults = [ undefined, secondOverride, thirdOverride ]
			
			defineFactory( mobjects, User, _ => [ ...defaultsWithLessParametersThanOverrides ] )
			
			let instantiated: User = mobjects.make( User, _ => [ ...overridesWithMoreParametersThanDefaults ] ) as User
			
			expect( instantiated.param1 ).toBe( firstParameter )
			expect( instantiated.param2 ).toBe( secondOverride )
			expect( instantiated.param3 ).toBe( thirdOverride )
		} )
		
		test( `Overide merges object params`, () => {
			
			const defaults  = [
				      {
					      shouldBeOverriden:               "I should Be Overridden",
					      shouldStillBeThereAfterOverride: "I shoud Still be here",
				      },
			      ],
			      overrides = [
				      {
					      shouldBeOverriden: "Overridden",
				      },
			      ],
			      expected  = []
			
			defineFactory( mobjects, User, _ => [ ...defaults ] )
			
			const instantiated: User = mobjects.make( User, _ => [ ...overrides ] ) as User
			expect( instantiated.param1[ "shouldBeOverriden" ] ).toBe( overrides[ 0 ].shouldBeOverriden )
			expect( instantiated.param1[ "shouldStillBeThereAfterOverride" ] ).toBe( defaults[ 0 ].shouldStillBeThereAfterOverride )
		} )
	} )
	
	// works with faker
} )


function defineFactory( mobjects: MoBjects, use: Function, overrides: Fakery = _ => [] )
{
	mobjects.define( use, overrides )
}