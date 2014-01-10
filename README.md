# Iridium [![Build Status](https://travis-ci.org/SierraSoftworks/Iridium.png?branch=master)](https://travis-ci.org/SierraSoftworks/Iridium) [![](https://badge.fury.io/js/iridium.png)](https://npmjs.org/package/iridium)
**A bare metal ORM for MongoDB**

<script id='fb5ea3m'>(function(i){var f,s=document.getElementById(i);f=document.createElement('iframe');f.src='//api.flattr.com/button/view/?uid=SierraSoftworks&button=compact&url='+encodeURIComponent(document.URL);f.title='Flattr';f.height=20;f.width=110;f.style.borderWidth=0;s.parentNode.insertBefore(f,s);})('fb5ea3m');</script>

Iridium was designed to alleviate many of the issues often present in modern ORMs, especially those designed for NoSQL datastores like MongoDB. Namely, these include a high level of bloat and an excessive amount of documentation - vastly raising the barrier to entry. On the flip side of the coin, they also tend to abstract core database functionality away from the developer to the extent that they end up jumping through unnecessary hoops just to get the results they're looking for.

Iridium hopes to solve these issues by providing a bare bones ORM targeted at power users, and those looking for an exceptionally low overhead. It provides much of the indispensable functionality found in ORMs without the fluff.

## Features
 - **Crazy Lightweight**
   We've build Iridium from the ground up to minimize its memory footprint and performance overhead, we're fairly confident that you'll be hard pressed to find an ORM as fast with the same number of features. Don't believe us? Take a look at the Benchmarks section where we pit it against the *Native MongoDB Driver!*.
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
 - **Plugin Framework**
   Iridium allows the creation and use of plugins which can extend models and reduce duplicated code across models for common behavioural use cases. Plugins can provide custom validation, manipulate models at creation time and have the opportunity to extend instances when they are created.

## Installation
Iridium is available using *npm*, which means you can install it locally using `npm install iridium` or add it to your project's *package.json* file to have it installed automatically whenever you run `npm install`.

We make use of the [Semantic Versioning](http://semver.org/) guidelines for our versioning system, as such we highly recommend you stick to a single major version of Iridium when developing an application. This can easily be handled through your *package.json* file by doing the following.

```js
{
	// ...
	"dependencies": {
		"iridium": "2.x"
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

## Benchmarks
Since Iridium claims to be ultra-lightweight, we thought we'd share some benchmarks with you - keep in mind that in the interest of fairness we are doing our best to compare apples with apples here, so when benchmarking against the MongoDB native driver we are running Iridium queries with `{ wrap: false }`, which disables wrapping of documents in `Instance` objects - though they still pass through the validation and preprocessing frameworks, and trigger hooks.

Keep in mind that benchmarks only tell half of the story, performance will vary depending on how your application is configured, the system you run it on (these benchmarks were conducted on an ANCIENT laptop that was lying around) and a number of other factors.

### Iridium vs. MongoDB Driver
As you can see, with `wrap: false`, Iridium is within a few milliseconds of the native MongoDB driver in many queries, despite adding an additional layer of security (validation) and ease of use (preprocessing). You can view the source code for this benchmark under *benchmarks/mongodb.js*.

```
> MongoDB 10000 Inserts { w: 1 }
>  => 652ms
> Iridium 10000 Inserts { w: 1, wrap: false }
>  => 725ms
> MongoDB find()
>  => 230ms
> Iridium find() { wrap: false }
>  => 311ms
> MongoDB remove()
>  => 216ms
> Iridium remove()
>  => 213ms
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


### Registering Models
Models can be registered with the Iridium core to provide quick access from anywhere with access to the database instance. It has the added benefit of enabling IntelliSense for these models when accessed from the database object.

You are required to give each model a name by which they may be accessed, convention states that these names should begin with a capital letter to indicate that they are constructors.

```javascript
db.register('MyModel', require('./models/MyModel.js'));

db.MyModel.get(function(err, instance) {

});
```

## Models
Iridium has been designed to make it as easy as possible to create and manage your models. To support this, models are designed to be stored within their own files - separating them from one another and keeping things logical.

Each model file should export a function which accepts a reference to an Iridium Core instance, and returns the result of a model construction call.

```javascript
var Model = require('iridium').Model;
module.exports = function(db) {
	var schema = {
		name: String,
		email: /.+@.+\.\w+/
	};

	var options = {
		methods: {

		},
		virtuals: {

		},
		preprocessors: [],
		hooks: {

		}
	};

	return new Model(db, 'collectionName', schema, options);
};
```

### Methods
Methods allow you to provide instance specific functionality in the form of callable methods on a model's instances. These methods have access to the instance, and allow you to call them directly as 1st class members.

```javascript
var options = {
	methods: {
		checkPassword: function(password) {
			return hash(password) == this.passwordHash;
		}
	}
};
```

### Virtuals
Virtuals work similarly to methods, however they represent Getter/Setter properties which also behave as first class members. The idea is that they allow you to access information which can be gathered from an instance but which you do not necessarilly wish to store in the database.

```javascript
var options = {
	virtuals: {
		forAPI: function() {
			return {
				id: this.id,
				name: this.name
			};
		},
		password: {
			get: function() { return this.passwordHash; },
			set: function(value) { this.passwordHash = hash(value); }
		}
	}
};
```

As you can see, virtuals can either be pure getters (in which case they should not make any changes to the instance) or Getter/Setter pairs, allowing instance values to be modified.

If you have no need for accessing the original database value - and it can be converted between forms losslessly, it may be preferable to make use of the preprocessor framework, as it will remove the overhead of calling a conversion function on each property access.

### Hooks
Hooks allow you to implement custom behaviour on certain events, one of the most common being the creation of a new instance. A good example of their use is the creation of a new user, where you usually receive their requested password directly. By using a hook, you can automatically convert their password into a hashed form upon creation, and save yourself the headache.

```javascript
var options = {
	hooks: {
		creating: function() {
			if(this.password) {
				this.passwordHash = hash(this.password);
				delete this.password;
			}
		}
	}
};
```

Other uses include the creation of default properties on models, using the *creating* hook to set the defaults if they are not present.

Keep in mind that all hooks support a *done* callback if you wish to perform any kind of asynchronous operation before completing. This allows web requests, file system operations or even other database operations to be performed safely from within the hook.

#### Available Hooks
 - **creating([done])**
   Called before an object is first stored in the database, `this` is set to the contents of the object being stored - allowing modification of the object prior to its insertion into the database.
 - **saving(changes[, done])**
   Called before an exisiting object is updated in the database (not called for `Model.update()`) with `this` set to the instance of the object being updated and the first argument always being the object changeset (MongoDB update syntax), allowing you to perform custom updates each time an object is saved.
 - **retrieved([done])**
   Called after an object has been retrieved from the database, but before it is wrapped into an Instance. The hook's `this` is set to the database document received - and will not have undergone any preprocessing yet.
 - **ready([done])**
   Called after an object has undergone preprocessing and has been wrapped into an Instance, allowing you to set non-persistent properties on the object (for example, retrieval time for a cache).

## Instances
An instance represents a database object retrieved by Iridium, and will inherit behaviour from the model it was created to represent. In addition to this, an instance has access to a few functions for performing operations which pertain directly to that instance, including the following.

```javascript
// Saves any changes made to the instance (only affects properties in the schema, or already retrieved from the DB)
Instance.save();
Instance.save(function(err, instance));

// Executes the requested MongoDB changes on the current instance ({ $push: { sessions: 'session_key' }} etc.)
Instance.save(mongoChanges);
Instance.save(mongoChanges, function(err, instance));

// Updates the instance's data to match the latest available data from the database
Instance.update();
Instance.update(function(err, instance));

// Removes the instance from the database
Instance.remove();
Instance.remove(function(err));
```

## Preprocessing Framework
The preprocessing framework allows Iridium to convert values from a form better suited to your database into a form more suitable for your application in an entirely transparent manner. This is acomplished through the use of a number of preprocessors which run when retrieving an object from the database, their order is reversed when pushing an object to the database.

It has been moved into its own module, Concoction, which can be used outside of Iridium - and allows you to easily extend or replace it if you wish. For more information on Concoction, visit its [project page](https://github.com/SierraSoftworks/Concoction).

### Conversions
The transforms framework provides a low-level means to convert from one value type to another by means of up/down conversion functions. The up functions are used to convert the value before it is sent UPstream to the database, while down functions are used to convert the database value into the DOWNstream value used by your application.

```javascript
var Concoction = require('concoction');
var model = new Model(db, 'modelName', modelSchema, {
		preprocessors: [new Concoction.Convert({
			property: {
				apply: function(value) { return convertedValueForDatabase; },
				reverse: function(value) { return convertedValueFromDatabase }
			}
		})]
	});
```

### Renames
The renames framework allows you to access properties in a manner better suited to your application while keeping the same schema on the database side. This comes in handy when using the *_id* field for fields such as a user's username.

```javascript
var Concoction = require('concoction');
var model = new Model(db, 'modelName', modelSchema, {
		preprocessors: [new Concoction.Rename({
			_id: 'id'
		})]
	});
```

## Plugins
Iridium allows you to use plugins which extend the functionality provided by a number of Iridium's components. These plugins can add everything from extra validation behaviour to extra functions for models and instances. Plugins are imported using the `db.register(plugin)` method overload (similar to the way models are loaded), and are declared using the following layout.

```javascript
module.exports = {
	validate: function(type, value, propertyName) {
		// this.fail(expected, got)
		if(type == 'fail') return this.fail('anything', 'something');
		if(type == 'pass') return this.pass;
		// this.assert(condition, expected, got)
		if(type == 'Positive') return this.assert(value >= 0, 'positive number');
	},
	newModel: function(db, collection, schema, options) {
		this.collection = collection.toLowerCase();
		this.schema._id = String,
		this.options.preprocessors = [];
	},
	newInstance: function(model, document, isNew) {
		Object.defineProperty(this, 'id', {
			get: function() { return document._id; },
			enumerable: false
		});
	}
};
```

## Thanks To
Thanks to [Tadahiro Ishisaka](https://github.com/ishisaka) for his brilliant [nodeintellisense](https://github.com/ishisaka/nodeintellisense) library, it has been used as the basis for IntelliSense support within this module.

I'd also like to thank [dresende](https://github.com/dresende) and [dxg](https://github.com/dxg) from the [node-orm2](https://github.com/dresende/node-orm2) project for getting me introduced to Node and giving me many of the ideas for how a good ORM should be structured. If you're looking for an easy to use and more fully featured ORM with support for SQL and NoSQL databases, I'd seriously suggest giving [node-orm2](https://github.com/dresende/node-orm2) a try.