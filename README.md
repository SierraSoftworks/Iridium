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
 - **Express Support**
   Everyone who has written code using Node.js knows about Express, to help make your life easier we've included support right out of the box for Express.
 - **Powerful Models**
   Iridium's models are designed to exist as individual files or modules within your application, this helps simplify management of your models and separates database design code from your application code. In addition to this, Iridium supports virtual properties, extension methods, transforms, client side property renaming and validations in an easy to understand and implement package.
 - **Caching Support**
   High performance web applications depend on accessing your data as quickly as possible, Iridium provides support for automated inline caching through any key-value store, allowing you to ensure that you can build the fastest application possible.
 - **Plugin Framework**
   Iridium allows the creation and use of plugins which can extend models and reduce duplicated code across models for common behavioural use cases. Plugins can provide custom validation, manipulate models at creation time and have the opportunity to extend instances when they are created.
 - **Automatic Query Generation**
   We understand that sometimes you don't want to structure your own queries - it's a hassle which you could do without especially when working with arrays. Thankfully, Iridium includes a powerful differential query generator which automatically generates the query necessary to store your changes without you raising a finger.
 - **[A+ Promises](https://github.com/petkaantonov/bluebird) Built In**
   We know how horrible it is having to manually wrap your favourite libraries before you can use them with promises, so we've decided to include support for the incredibly fast [Bluebird](https://github.com/petkaantonov/bluebird) promises library out of the box! (Iridium actually uses it internally as the primary handler, delegating back to callbacks for compatibility, don't tell anybody.)

## Installation
Iridium is available using *npm*, which means you can install it locally using `npm install iridium` or add it to your project's *package.json* file to have it installed automatically whenever you run `npm install`.

We make use of the [Semantic Versioning](http://semver.org/) guidelines for our versioning system, as such we highly recommend you stick to a single major version of Iridium when developing an application. This can easily be handled through your *package.json* file by doing the following.

```javascript
{
	// ...
	"dependencies": {
		"iridium": "4.x"
	}
}
```

## Example
```javascript
var iridium = require('iridium');

var database = new iridium({
	database: 'demo'
});

database.register('User', new iridium.Model(database, 'user', {
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

```javascript
{
	host: 'localhost', // Optional
	port: 27018, // Optional
	username: '', // Optional
	password: '', // Optional
	database: 'iridium'
}
```

Alternatively, you can pass in a standard MongoDB URI like `mongodb://username:password@localhost:27018/iridium` in place of the configuration object, allowing Iridium to easily be used with MongoS.

Once you've got a core, you need to connect it to the database. This is done by calling the core's *connect* method and giving it a callback function.


### Registering Models
Models can be registered with the Iridium core to provide quick access from anywhere with access to the database instance. It has the added benefit of enabling IntelliSense for these models when accessed from the database object.

You are required to give each model a name by which they may be accessed, convention states that these names should begin with a capital letter to indicate that they are constructors.

```javascript
db.register('MyModel', require('./models/MyModel.js'));

db.MyModel.get(function(err, instance) {

});
```

You can also chain `register` calls to quickly load all your different models using a single line of code.

```javascript
db.register('Model1', require('./models/Model1.js')).register('Model2', require('./models/Model2.js')).connect(function(err, db) {
	if(err) throw err;
});
```

## Database API
We've tried to keep the Iridium API as similar to the original MongoDB Native Driver's API as possible, while still keeping it extremely easy to use. The following are a bunch of TypeScript definitions showing the different overloads available to you for Iridium's methods.
If you don't understand TypeScript then it's easiest to think of it this way. You can use any method available from the MongoDB Native Driver using (usually) the same arguments, except the callbacks are entirely optional and a promise is always returned. On methods which select items, you can simply provide the `_id` field's value to have it automatically converted and wrapped, so doing something like `users.find('spartan563')` is entirely fine.

```typescript
interface FindFunction {
	(): promise;
	(callback: function): promise;
	(identifier: any): promise;
	(identifier: any, callback: function): promise;
	(identifier: any, options: object, callback: function): promise;
	(conditions: object): promise;
	(conditions: object, callback: function): promise;
	(conditions: object, options: object, callback: function): promise;
}

interface InsertFunction {
	(document: object): promise;
	(document: object, callback: function): promise;
	(document: object, options: object): promise;
	(document: object, options: object, callback: function): promise;
	(documents: [object]): promise;
	(documents: [object], callback: function): promise;
	(documents: [object], options: object): promise;
	(documents: [object], options: object, callback: function): promise;
}

interface UpdateFunction {
	(conditions: object, changes: object): promise;
	(conditions: object, changes: object, callback: function): promise;
	(conditions: object, changes: object, options: object): promise;
	(conditions: object, changes: object, options: object, callback: function): promise;
}

interface EnsureIndexFunction {
	(index: object): promise;
	(index: object, options: object): promise;
	(index: object, callback: function): promise;
	(index: object, options: object, callback: function): promise;
}

var find: FindFunction;
var findOne: FindFunction;
var get: FindFunction = findOne;

var insert: InsertFunction;
var create: InsertFunction = insert;
var update: UpdateFunction;

var count: FindFunction;
var remove: FindFunction;

var aggregate: function;

var ensureIndex: EnsureIndexFunction;
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

### Validation
Iridium now (as of **v2.11.0**) uses [skmatc](https://sierrasoftworks.com/skmatc)(pronounced schematic) for schema validation, it allows you to quickly and easily write complex schemas in a readable manner and provides a powerful extensibility framework which you can use if you require more complex validation logic.

```javascript
var schema = {
    username: /\w[\w\d_]{7,}/,
    email: String,
    dateOfBirth: Date,

    sessions: [{
        id: String,
        started: Date,
        valid: Boolean
    }]
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

### Events
Are you a fan of using EventEmitters? Are you too cool for school? No worries, we've got you covered. You can consume events on both models and instances using Node.js' standard event consumption functions, they behave much the same as their hook cousins with the exception that there is no way to safely manipulate the object (their call order is non-deterministic).

```javascript
// Called for all validation, hook and database errors
model.on('error', function error(err) { });
// Called when an object is being created in the database
model.on('creating', function creating(document) { });
// Called when an object is being saved to the database
model.on('saving', function saving(instance, changes) { });
// Called when an object is retrieved from the database/cache
model.on('retrieved', function retrieved(instance) { });
// Called when a new instance becomes ready
model.on('ready', function ready(instance) { });

instance.on('error', function error(err) { });
instance.on('creating', function creating(document) { });
instance.on('saving', function saving(instance, changes) { });
instance.on('retrieved', function retrieved(instance) { });
instance.on('ready', function ready(instance) { });
```

## Instances
An instance represents a database object retrieved by Iridium, and will inherit behaviour from the model it was created to represent. In addition to this, an instance has access to a few functions for performing operations which pertain directly to that instance, including the following.

```javascript
// Saves any changes made to the instance (only affects properties in the schema, or already retrieved from the DB)
Instance.save().then(function complete(instance) { }, function error(err) { });
Instance.save(function callback(err, instance) {});

// Executes the requested MongoDB changes on the current instance ({ $push: { sessions: 'session_key' }} etc.)
Instance.save(mongoChanges).then(function complete(instance) { }, function error(err) { });
Instance.save(mongoChanges, function callback(err, instance) {});

// Used for manipulating specific array elements, you can use extraConditions to select the array element to manipulate
// For example Instance.save({ array: { $elemMatch: { id: 1 }}}, { $inc: { 'array.$.hits': 1 }});
Instance.save(extraConditions, mongoChanges).then(function complete(instance) { }, function error(err) { });
Instance.save(extraConditions, mongoChanges, function callback(err,instance) {})

// Updates the instance's data to match the latest available data from the database
Instance.update().then(function complete(instance) { }, function error(err) { });
Instance.update(function callback(err, instance) {});

// Removes the instance from the database
Instance.remove().then(function complete() { }, function error(err) { });
Instance.remove(function callback(err) {});
```

### Helpers
The Instance object has a number of helper properties and functions available which prove useful in common use cases. These include the `document` virtual property which returns the underlying document which the Instance represents - allowing you to easily perform JSON serialization. Keep in mind that this document will have passed through the preprocessing framework. This property will be transparently overridden by Instances who's schema defines a `document` property.

You will also find the `select` and `first` methods which can be used to filter an array or map for items which match certain criteria. They are based on [lodash](http://lodash.org)'s _.filter and _.first methods and by default will bind `this` to the Instance on which they are called.

```javascript
console.log(JSON.stringify(Instance.document));

var session = Instance.first(Instance.sessions, function test(session) {
	return session.id == 'abcdef...';
});

var comments = Instance.select(Instance.comments, function test(comment) {
	return comment.by = 'username';
});
```

### Differential Queries
In **v2.9.4** we added a powerful new differential query generator (codename Omnom) which allows you to easily make changes to your instances in code, and have Iridium handle the task of converting those changes to the most efficient query possible when you want to store those changes in MongoDB.

Omnom allows you to do many things without needing to worry about how they are persisted to the database. These are some of the things that Omnom is well suited to handling.

 - Change properties or their children
 - Change the value of an array's element or its children
 - Remove elements from an array
 - Add elements to the end of an array
 - Selectively replacing an array's elements

Unfortunately, there are a few limitations imposed by the way MongoDB handles queries - so when working with Iridium and Omnom we recommend you try to avoid doing the following.

 - Removing elements from an array while adding/changing others (will result in the array being replaced)
 - Inserting elements at the front of an array (consider reversing the array using a Concoction if you want a stack implementation that is fast)

## Caching Framework
Our caching framework allows basic queries to be served against a high performance cache, offloading requests from your database server and allowing you to more easily develop high performance applications that scale well to user demand. 

Your cache will **only** be tried for `Model.get` and `Model.findOne` requests for which the cache's `valid()` function returns true, allowing you to implement any basic cache structure you wish - including compound caches should you wish.

By default Iridium doesn't cache anything, implementing a no-op cache, but you can easily configure your own caching plugin on a per-model basis by following this example.

```javascript
function MemoryCache() {
	this.cache = {};
}

// Tells Iridium whether it can use the cache for objects that match these conditions
MemoryCache.prototype.valid = function valid(conditions) {
	return conditions && conditions._id;
};

MemoryCache.prototype.store = function store(conditions, document, callback) {
	// Conditions are null when storing on an insert, otherwise they represent the conditions
	// that resulted in the object being retrieved from the database.
	var id = JSON.stringify(document._id);
	this.cache[id] = document;
	callback();
};

MemoryCache.prototype.fetch = function fetch(id, callback) {
	var id = JSON.stringify(conditions._id);
	callback(this.cache[id]);
};

MemoryCache.prototype.drop = function drop(conditions, callback) {
	var id = JSON.stringify(conditions._id);
	if(this.cache[id]) delete this.cache[id];
	callback();
};
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
				apply: function apply(value) { return convertedValueForDatabase; },
				reverse: function reverse(value) { return convertedValueFromDatabase }
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
Iridium allows you to use plugins which extend the functionality provided by a number of Iridium's components. These plugins can add extra functions for models and instances as well has allowing hooks to be added automatically. Plugins are imported using the `db.register(plugin)` method overload (similar to the way models are loaded), and are declared using the following layout.

```javascript
module.exports = {
	newModel: function newModel(db, collection, schema, options) {
		this.collection = collection.toLowerCase();
		this.schema._id = String,
		this.options.preprocessors = [];
	},
	newInstance: function newInstance(model, document, isNew) {
		Object.defineProperty(this, 'id', {
			get: function() { return document._id; },
			enumerable: false
		});
	}
};
```

## Thanks To
I'd also like to thank [dresende](https://github.com/dresende) and [dxg](https://github.com/dxg) from the [node-orm2](https://github.com/dresende/node-orm2) project for getting me introduced to Node and giving me many of the ideas for how a good ORM should be structured. If you're looking for an easy to use and more fully featured ORM with support for SQL and NoSQL databases, I'd seriously suggest giving [node-orm2](https://github.com/dresende/node-orm2) a try.
