# Iridium
**A bare metal ORM for MongoDB**

[![Build Status](https://travis-ci.org/SierraSoftworks/Iridium.png?branch=master)](https://travis-ci.org/SierraSoftworks/Iridium)
[![](https://badge.fury.io/js/iridium.png)](https://npmjs.org/package/iridium)

Iridium was designed to alleviate many of the issues often present in modern ORMs, especially those designed for NoSQL datastores like MongoDB. Namely, these include a high level of bloat and an excessive amount of documentation - vastly raising the barrier to entry. On the flip side of the coin, they also tend to abstract core database functionality away from the developer to the extent that they end up jumping through unnecessary hoops just to get the results they're looking for.

Iridium hopes to solve these issues by providing a bare bones ORM targeted at power users, and those looking for an exceptionally low overhead. It provides much of the indispensable functionality found in ORMs without the fluff.

## Features
 - **Flexible Schema Validation**
   MongoDB's greatest strength is its ability to support dynamic schemas, we think that's a great idea but sometimes it's necessary to be able to validate aspects of your models. That's where Iridium's validation framework comes in - with an intuitive schema design framework with support for optional and dynamic fields, you'll never find yourself stuck again.
 - **Powerful Transforms**
   Anyone familiar with MongoDB knows the headaches that ObjectID causes due to its custom datatype. We also know that sometimes custom datatypes are unavoidable, or preferable for storage - though not necessarily ideal for processing. Iridium allows you to define a set of up-down transforms which are applied to parts of your model so that your code doesn't need to worry about these inconsistencies, and you can get down to writing the code you want to.
 - **IntelliSense Support**
   We understand the value of an easy to use library, and having to go *documentation diving* every time you want to find out how to use a function is a pain we're all to familiar with. Iridium was designed from the ground up to include support for Visual Studio's IntelliSense engine - reducing the number of round trips between documentation and your code.
 - **Express Support**
   Everyone who has written code using Node.js knows about Express, to help make your life easier we've included support right out of the box for Express.
 - **Powerful Models**
   Iridium's models are designed to exist as individual files or modules within your application, this helps simplify management of your models and separates database design code from your application code. In addition to this, Iridium supports virtual properties, extension methods, transforms, client side property renaming and validations in an easy to understand and implement package.

## Installation
Iridium is available using *npm*, which means you can install it locally using `npm install iridium` or add it to your project's *package.json* file to have it installed automatically whenever you run `npm install`.

We make use of the [Semantic Versioning](http://semver.org/) guidelines for our versioning system, as such we highly recommend you stick to a single major version of Iridium when developing an application. This can easily be handled through your *package.json* file by doing the following.

```js
{
	// ...
	"dependencies": {
		"iridium": "1.x"
	}
}
```

## Example
```js
var iridium = require('iridium');

var database = new iridium({
	database: 'demo'
});

database.register('User', new iridium.Model('user', {
	firstname: String,
	lastname: String,
	since: Date,
	clown: Boolean,
	houses: [{
		address: String,
		colour: /Red|White|Blue|Green|Pink/
	}]
}));

database.connect(function(err, db) {
	if(err) throw err;

	// at this point database == db

	db.User.create({
		firstname: 'Billy',
		lastname: 'Bob',
		since: new Date(),
		clown: true,
		houses: [
			{ address: 'The middle of nowhere', colour: 'Red' }
		]
	}, function(err, user) {
		if(err) throw err;

		console.log(JSON.stringify(user));
	});
});

```

## Core
The Iridium core (that sounds WAY cooler than I intended when I came up with the name) is where you create a database connection and register any models to be used by the database. Registration of models is optional, however it makes accessing them easier.

When using Iridium, you are required to instantiate a core with a settings object which describes the database server you want to connect to. This is done by calling the core's constructor and passing an object similar to the following.

```js
{
	host: 'localhost', // Optional
	port: 27018, // Optional
	username: '', // Optional
	password: '', // Optional
	database: 'iridium'
}
```

Once you've got a core, you need to connect it to the database. This is done by calling the core's *connect* method and giving it a callback function.
TODO

## Models
TODO

## Instances
TODO