import { ModelBuilderDirector } from "./ModelBuilderDirector"




export class NullClassModelBuilderDirector implements ModelBuilderDirector<any>
{
	make( overrides?, states? )
	{
		return {}
	}
	
	
	registerState( state, overrides ): this
	{
		return this
	}
}