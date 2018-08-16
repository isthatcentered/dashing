# Dashing
@todo: description, link to features

## How do I install this thing ?
```sh
# Using npm
$ npm install dashing --save-dev

# Using yarn
$ yarn add dashing --save-dev
```


## How do I use this thing ?
### Importing
```javascript
// Import with typescript
import * as makeDashing from "dashing"

// Import with ES6
import makeDashing from "dashing"

// Import with node
const makeDashing = require("dashing")
```

### Initialize dashing
Dashing does not comes as a singleton to give you flexibility. 
This means you can have multiple instances if needed, 
but you have to instantiate it by yourself.

Fortunately, this is quite simple:
```javascript
// someFile.js
import makeDashing from "dashing"

export const dashing = makeDashing({}) // will return a unique instance of dashing


// someOtherFile.js
import dashing from "./someFile" // if exported as default
import { dashing } from "./someFile" // if not exported as default

let freshPreConfiguredUserObject = dashing(User)
	.make() // have fun
```

### Defining a model factory
```javascript
// someFile.js
import * as makeDashing from "dashing"

let dashing = makeDashing({}) // will return a unique instance of dashing

// Creating the default state for every User generated by dashing
dashing.define( User, _ => ["Bruce", "Wayne", "🥞"] ) //  new User(Bruce, Wayne, 🥞)

// Creating the default state for every Product generated by dashing
dashing.define( Product, _ => [9.99, "Philosopher stone"] ) // equals new Product(9.99, "philospher stone")

export default dashing 

// or if multiple exports 
export { dashing, otherStuff }
```

But wait, dashing is way more powerful than that. You can haz presets 😍

#### Create presets
```javascript
// someFile.js
import makeDashing from "dashing"

let dashing = makeDashing({}) 

dashing.define( User, _ => ["Bruce Wayne", "🥞"] ) //  new User(Bruce, Wayne, 🥞)
	.registerPreset( "superHero", _ => [ "Catwoman", "🥛" ] ) //  new User(Catwoman, "🥛" )
	.registerPreset( "superVilain", _ => [ "twoface", "🍉" ] ) // new User( "twoface", "🍉" )
	.registerPreset( "batman", _ => [ undefined, "🍕" ] ) // new User( "Bruce Wayne", "🍕" )

dashing.define( Product, _ => [9.99, 10, "Philosopher stone"] ) // equals new Product(9.99, 10, "philospher stone")
	.registerPreset( "soldOut", _ => [ undefined, 0] ) // equals new Product(9.99, 0, "philospher stone")
	.registerPreset( "crappy", _ => [1, 100, "Crappy product"] ) // equals new Product(1, 100, "Crappy product)

export default dashing
```

#### Modify the instance after creation
You might not use you constructor to configure your objects. Or use a bit of constructors and methods. Fine with me, here's how you can do that with dashing 😎 

```javascript
// someFile.js
import makeDashing from "dashing"

let dashing = makeDashing({}) 

dashing.define( User, _ => ["Bruce", "Wayne", "🥞"] ) //  new User(Bruce, Wayne, 🥞)

const myDefaultCallback = (instance, _) => {
	instance.setBreakfast("🥞")
}

const myCallbackForAState = (instance, _) => {
    return instance.setMood("tired") // If you return the object (in case immutable or something, we will use it for the next process)
} 

dashing.define( User, _ => ["Alfred"], myDefaultCallback) // Will apply this cllback to every created instance
	.registerPreset( "tiredAlfred", () => [], myCallbackForAState) // Will apply this callback to instance generated with this state
	
export default dashing
````

### Use the model factory
Now that you have instanciated dahsing and defined your presets, let's make some 😎
```javascript
import dashing from "./someFile"

const instance = dashing(User)
	.make(); // By the way, if you registered a callback it will have been applied to the resulting instance 😁
````

#### Last minute overrides
```javascript
import dashing from "./someFile"

const instance = dashing(User)
	.make([undefined, "else"]); // Considering defaults ["Catwoman", "something"], will make new User("catwoman", "else")
````

#### Using a/multiple presets
```javascript
import dashing from "./someFile"

const instance = dashing(User)
 	.preset( "tiredAlfred" ) // Each state params & it's callback will be applied on top of the other in the oreder you asked for
	.preset( "hungryAlfred" ) // (aka here moodyAlfred on top of hungryAlfred which is applied on top of tiredAlfred
	.preset( "moodyAlfred" )
	.make();

// or
const instance = dashing(User)
 	.preset( ["tiredAlfred", "hungryAlfred", "moodyAlfred"] )
	.make();
````

#### Make multiple instances
```javascript
import dashing from "./someFile" 

const instanceS = dashing(User)
	.preset( "tiredAlfred" )
	.times(99)
	.make(); // we return an array when you ask for multiple instances 📦
````

### Randomize data 
So, I intended to ship it with a default data generator. But frankly the package was 10x th size soooo... 😱

Here are your options:
 
#### Use one of those
- https://chancejs.com/
- https://github.com/marak/Faker.js/
- (note, there are many others)

```javascript
// someFile.js
import makeDashing from "dashing"
import faker from "faker" // import your generator

let dashing = makeDashing(faker) // pass it to makeDashing and, voila! 🤑

dashing.define(User, generator => {
	return [generator.someMethodOfUsedGenerator(), {active: true, id: generator.makeMeSomeId()}]
}, (instance, generator) => { // Available for callback too ❤️
	instance.setSomething(generator.generateSomething())	
})

export default dashing


// someRandomFile.js
import dashing from "./someFile"
 
dashing(User)
	.make(generator => [generator.generateSomeStuff()]) // For overrides too 😍
````


#### Write your own
I just pass you the generator, so you can pass whatever object you want as generator.

```javascript
// someFile.js
import makeDashing from "dashing"

// This is a pointless but valid generator
const quotesGenerator = {
	giveMeADrakeQuote: () => "I like sweaters. I have a sweater obsession, I guess. -Drake"
}

let dashing = makeDashing(quotesGenerator) // pass it to makeDashing and, voila! 🤑

dashing.define(User, generator => [{greeting: generator.giveMeADrakeQuote()}])

export default dashing
````