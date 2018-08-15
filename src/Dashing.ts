import { Builder, ModelBuilder } from "./Builder"
import * as faker from "faker"




export type seed = ( generator ) => any[]

export type dashingCallback = ( instance: any, generator: any ) => any | void

export interface Dashing
{
	( model: Function ): Builder
	
	define: ( model: Function, seed: seed, onCreatedCallback?: dashingCallback ) => Builder;
}

export interface dashingFactory
{
	( generator: any ): Dashing
}

export const makeDashing: dashingFactory = (( generator: any = faker ) => {
	
	const _builders: Map<Function, Builder> = new Map()
	
	let _dashing: any = ( model ) =>
		_builders.get( model )
	
	_dashing.define = ( model, seed, onCreatedCallback ) =>
		_builders
			.set( model, new ModelBuilder( generator, model, seed, onCreatedCallback ) )
			.get( model )
	
	return _dashing
})