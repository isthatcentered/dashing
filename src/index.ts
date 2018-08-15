import { Dashing, onCreatedCallback, seedFactory } from "./Dashing"
import { Builder } from "./Builder"
import * as faker from "faker"




interface dashing
{
	( model: Function ): Builder
	
	define: ( model: Function, seed: seedFactory, onCreatedCallback?: onCreatedCallback ) => Builder;
}



let makeDashing = (( generator: any = faker ): dashing => {
	
	const dashing = new Dashing( generator )
	
	let f: any = ( model ) =>
		dashing.getFactory( model )
	
	f.define = ( model, seed, onCreatedCallback ) =>
		dashing.define( model, seed, onCreatedCallback )
	
	return f
})



export = makeDashing

