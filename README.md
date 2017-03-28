# Iridium
**A High Performance, IDE Friendly ODM for MongoDB**

[![NPM Module](https://badge.fury.io/js/iridium.svg)](https://npmjs.org/package/iridium)
[![Build Status](https://travis-ci.org/SierraSoftworks/Iridium.svg?branch=release)](https://travis-ci.org/SierraSoftworks/Iridium)
[![Coverage Status](https://coveralls.io/repos/SierraSoftworks/Iridium/badge.svg?branch=release)](https://coveralls.io/r/SierraSoftworks/Iridium?branch=release)
[![bitHound Overall Score](https://www.bithound.io/github/SierraSoftworks/Iridium/badges/score.svg)](https://www.bithound.io/github/SierraSoftworks/Iridium)
[![bitHound Code](https://www.bithound.io/github/SierraSoftworks/Iridium/badges/code.svg)](https://www.bithound.io/github/SierraSoftworks/Iridium)
[![bitHound Dependencies](https://www.bithound.io/github/SierraSoftworks/Iridium/badges/dependencies.svg)](https://www.bithound.io/github/SierraSoftworks/Iridium/master/dependencies/npm)

Iridium is designed to offer a high performance, easy to use and above all, editor friendly ODM for MongoDB on Node.js.
Rather than adopting the "re-implement everything" approach often favoured by ODMs like Mongoose and friends, requiring
you to learn an entirely new API and locking you into a specific coding style, Iridium tries to offer an incredibly
lightweight implementation which makes your life easier where it counts and gets out of your way when you want to do
anything more complex.

It also means that, if you're familiar with the MongoDB CLI you should find working with Iridium very natural, with all database
methods returning promises for their results and sensible, type annotated results being provided if you wish to make use of them.

## Installation
Iridium makes use of the latest set of `@types` TypeScript definitions files, allowing you to install everything using just a
simple `npm install`.

```bash
npm install iridium --save
```

## Features
 - **Built with TypeScript** and designed for ease of use, you'll be hard pressed to find another Node.js ORM as easy to pick
   up and learn when combined with a supporting editor.
 - **Promises Throughout** mean that you can easily start working with your favourite A+ compliant promise library and writing
   more readable code. Don't think promises are the way forward? Stick with callbacks, Iridium supports both.
 - **Fully Tested** with over 300 unit tests and over 95% test coverage, helping to ensure that Iridium always behaves the way
   it's supposed to.
 - **Decorator Support** helps describe your classes in an easy to understand and maintain manner, embrace ES7 with strong fallbacks
   on ES5 compliant approaches.
 - **Fall into Success** with Iridium's carefully designed API - which is structured to help ensure your code remains maintainable
   regardless of how large your project becomes.
 - **Amazing Documentation** which covers the full Iridium API, and is always up to date thanks to the brilliant TypeDoc project,
   can be found at [sierrasoftworks.github.io/Iridium](http://sierrasoftworks.github.io/Iridium).

## Requirements
Iridium is built on top of a number of very modern technologies, including TypeScript 2.0, JavaScript ES6 and the latest MongoDB
Node.js Driver (version 2.2). You'll need to be running Node.js 6.x, or 4.x with the `--harmony` flag to run version 7 of Iridium.
For older versions of Node.js, please considering using version 6 of Iridium instead.

For starters, you will need to be running MongoDB 2.6 or later in order to use Iridium - however we recommend you use MongoDB 3.1
due to the various performance improvements they've made. If you're working with TypeScript, you will also need to use the 2.0
compiler or risk having the Iridium type definitions break your project.

## Using Iridium
Rather than opt of the usual "Look how quickly you can do something" approach, we thought it might be useful to see
an example which covers most of the stuff you'd need to do in Iridium. This example covers defining your own document
interfaces, a custom schema and instance type which provides some additional methods.

You'll notice that the `House` class extends Iridium's `Instance` class, which gives it methods like `save()` as well
as change tracking when calling `save()` on the instance. If you'd prefer a lighter approach or to use your own home-grown
implementation then you can do so by taking a look at the [Custom Instances](#custom-instances) section.

```typescript
import {Core, Model, Instance, Collection, Index, Property, ObjectID} Iridium from 'iridium';

interface Colour {
    r: number;
    g: number;
    b: number;
}

interface Car {
    make: string;
    model: string;
    colour: Colour;
}

interface HouseDocument {
    _id?: string;
    name: string;

    cars?: Car[];
}

@Index({ name: 1 })
@Collection('houses')
class House extends Instance<HouseDocument, House> implements HouseDocument {
    @ObjectID _id: string;
    @Property(/^.+$/)
    name: string;

    @Property([{
        make: String,
        model: String,
        colour: {
            r: Number,
            g: Number,
            b: Number
        }
    }])
    cars: Car[];

    static onCreating(doc: HouseDocument) {
        doc.cars = doc.cars || [];
    }

    addCar(make: string, model: string, colour: Colour) {
        this.cars.push({
            make: make,
            model: model,
            colour: colour
        });
    }

    get numberOfCars() {
        return this.cars.length;
    }
}

class MyDatabase extends Core {
    Houses = new Model<HouseDocument, House>(this, House);
}

var myDb = new MyDatabase({ database: 'houses_test' });

myDb.connect().then(() => myDb.Houses.insert({
        name: 'My House',
        cars: [{
            make: 'Audi',
            model: 'A4',
            colour: { r: 0, g: 0, b: 0 }
        }]
    }))
    .then(() => myDb.Houses.get())
    .then((house) => {
        house.addCar('Audi', 'S4', { r: 255, g: 255, b: 255 });
        return house.save();
    })
    .then(() => myDb.close());
```

## Defining a Model
Iridium models are created with a reference to their Core (which provides the database connection) and an `InstanceType` which
is composed of a constructor function as well as a number of static properties providing configuration information for the instance.

**JavaScript**
```javascript
new Model(core, InstanceType);
```

**TypeScript**
```typescript
new Model<DocumentInterface, InstanceType>(core, InstanceType);
```

If you're working with TypeScript, you can provide an interface for the document structure used by the database, which will allow you
to get useful type hints when you are creating documents. You can also provide the `InstanceType` to provide useful type information
for any instances which are retrieved from the database. This information is carried through all promises and callbacks you will use
within Iridium and it makes your life significantly easier.

Typically you will expose your models as variables on a custom Core implementation like this.

```typescript
class MyCore extends Core {
    MyModel = new Model<MyDocumentInterface, MyInstanceType>(this, MyInstanceType);
}
```

## The InstanceType Constructor
The InstanceType constructor is responsible for creating objects which represent a document retrieved from the database. It also provides
a number of configuration details which are used to determine how Iridium works with the model.

There are two approaches to defining an instance constructor - the first is to create a true wrapper like the one provided by `Iridium.Instance`
which offers helper methods like `save()` and `remove()`, which comes in very handy for writing concise descriptive code, while the other approach
is to simply return the document received from the database - great for performance or security purposes.

**TypeScript**
```typescript
interface Document {
    _id?: string;
}

class InstanceType {
    constructor(model: Model<Document, Instance>, document: Document, isNew: boolean = true, isPartial: boolean = false) {

    }

    _id: string;

    static schema: Iridium.Schema = {
        _id: false
    };

    static collection = 'myCollection';
}
```

**JavaScript**
```javascript
module.exports = function(model, document, isNew, isPartial) {

}

module.exports.collection = 'myCollection';
module.exports.schema = {
    _id: false
};
```

### Configuration Options
As we mentioned, configuration of a model is conducted through static properties on its constructor. These configuration options include
the `schema` which is used to validate that all data inserted into the database through Iridium meets certain conditions, the `collection`
which specifies the name of the MongoDB collection into which the documents are stashed and a couple of others worth noting.

#### Schema
Iridium uses [Skmatc](https://github.com/SierraSoftworks/Skmatc) for schema validation, you can read more about it on its project page but
we'll give a quick rundown of the way you make use of it here.

The model's schema is defined using an object in which keys represent their document property counterparts while the values represent a validation
rule. You can also make use of the [`@Property`](http://sierrasoftworks.github.io/Iridium/globals.html#property) decorator to automatically build
up your schema object.

**TypeScript**
```typescript
class InstanceType {
    _id: string;
    email: string;

    static schema: Iridium.Schema = {
        _id: false,
        email: /^.+@.+$/
    };
}
```

```typescript
class InstanceType extends Iridium.Instance<any, InstanceType> {
    @Iridium.ObjectID
    _id: string;
    
    @Iridium.Property(String)
    email: string;
}
```

**JavaScript**
```javascript
function InstanceType() {}

InstanceType.schema = {
    _id: false,
    email: /^.+@.+$/
};
```


### The Iridium Instance Class
Instead of implementing your own instance constructor every time, Iridium offers a powerful and tested instance base class which provides
a number of useful helper methods and a diff algorithm allowing you to make changes in a POCO manner.

To use it, simply inherit from it (if you need any computed properties or custom methods) or provide it as your instance type when instantiating
the model.

**TypeScript**
```typescript
class InstanceType extends Iridium.Instance<Document, InstanceType> {
    _id: string;
}

new Iridium.Model<Document, InstanceType>(core, InstanceType);
```

**JavaScript**
```javascript
function InstanceType() {
    Iridium.Instance.apply(this, arguments);
}

require('util').inherits(InstanceType, Iridium.Instance);

new Iridium.Model(core, InstanceType);
```

If you've used the `Iridium.Instance` constructor then you'll have a couple of useful helper methods available to you. These include `save()`, `refresh()`,
`update()`, `remove()` and `delete()` which do more or less what it says on the can - `refresh` and `update` are synonyms for one another as are `remove` and
`delete`.

You'll also find `first()` and `select()` which allow you to select the first, or all, entr(y|ies) in a collection which match a predicate - ensuring that `this`
maps to the instance itself within the predicate - helping to make comparisons somewhat easier within JavaScript ES5.

## Best Practices
There are a number of best practices which you should keep in mind when working with Iridium to help get the best possible experience. For starters, Iridium is
built up of a number of smaller components - namely the [validation](https://github.com/sierrasoftworks/skmatc), transform and caching layers.

### Validation Layer
The validation layer allows you to plug in your own custom validators, or simply make use of the built in ones, to quickly validate your documents against a
strongly defined schema. It is designed to enable you to quickly generate meaningful and human readable validation messages, minimizing the need for error
translation within your application.

Custom validators can be added either using the [`validators`](http://sierrasoftworks.github.io/Iridium/interfaces/instanceimplementation.html#validators) property
or by using the [`@Validate`](http://sierrasoftworks.github.io/Iridium/globals.html#validate) decorator on your instance class.

```typescript
@Iridium.Validate('myValidator', function(schema, data, path) {
    return this.assert(data == 42)
})
export class InstanceType extends Iridium.Instance<any, InstanceType> {
    @Iridium.Property('myValidator')
    myProperty: number;
}
```

```javascript
var skmatc = require('skmatc');

function InstanceType() {
    Iridium.Instance.apply(this, arguments);
}

require('util').inherits(InstanceType, Iridium.Instance);

InstanceType.validators = [
    skmatc.create(function(schema) {
        return schema === 'myValidator';
    }, function(data, schema, path) {
        return data === 42;
    })
];

InstanceType.schema = {
    myProperty: 'myValidator'
};
```

Iridium expects validators to operate in a read-only mode, modifying documents within your validators (while possible) is strongly discouraged as it can lead
to some strange side effects and isn't guaranteed to behave the same way between releases. If you need to make changes to documents, take a look at the Transform
Layer. 

### Transform Layer
The transform layer is designed to make changes to the documents you store within MongoDB as well as the data presented to your application. A good example is the
way in which ObjectIDs are treated, within your application they appear as plain strings - allowing you to quickly and easily perform many different operations with
them. However, when you attempt to save an ObjectID field to the database, it is automatically converted into the correct ObjectID object before being persisted.

The transform layer allows you to register your own transforms both on a per-model and per-property basis. In the case of a model, the transform is given the whole
document and is expected to return the transformed document. Property transforms work the same, except that they are presented with, and expected to return, the value
of a single top-level property.

The easiest way to add a transform is using the [`@Transform`](http://sierrasoftworks.github.io/Iridium/globals.html#transform) decorator, however if you are working
in a language which doesn't yet support decorators then you can easily use the
[`transforms`](http://sierrasoftworks.github.io/Iridium/interfaces/instanceimplementation.html#transforms) property on your instance class.

```typescript
@Iridium.Transform(document => {
    document.lastFetched = new Date();
}, document => {
    document.lastFetched && delete document.lastFetched;
    return document;
})
export class InstanceType extends Iridium.Instance<any, InstanceType> {
    @Iridium.Transform(data => data.toUpperCase(), data => data.toLowerCase())
    email: string;
}
```

```javascript
function InstanceType() {
    Iridium.Instance.apply(this, arguments);
}

require('util').inherits(InstanceType, Iridium.Instance);

InstanceType.transforms = {
    $document: {
        fromDB: document => {
            document.lastFetched = new Date();
        },
        toDB: document => {
            document.lastFetched && delete document.lastFetched;
            return document;
        }
    },
    email: {
        fromDB: value => value.toUpperCase(),
        toDB: value => value.toLowerCase()
    }
};
```

#### Useful Transform Tricks
There are a couple of clever tricks you can do using transforms to enable additional functionality within Iridium. An example would be cleaning your documents of properties
not defined within your schemas whenever they are saved to the database.

##### Strict Schemas
Let's say you want to only insert values which appear in your schemas - an example would be if you accept documents from a REST API and don't wish to manually cherry-pick
the properties you are going to insert. It could also simply be a way of lazily cleaning up old properties from documents as your schema evolves over time, helping to avoid
complications if someone forgets to clean up the database after making changes to the schema.
This can be easily achieved using the `$document` transform.

```typescript
@Iridium.Transform(document => document, (document, property, model) => {
    Object.keys(document).forEach(key => {
        if(!model.schema.hasOwnProperty(key)) delete document[key];
    });
    
    return document;
})
export class InstanceType extends Iridium.Instance<any, InstanceType> {
    
}
```

```javascript
function InstanceType() {
    Iridium.Instance.apply(this, arguments);
}

require('util').inherits(InstanceType, Iridium.Instance);

InstanceType.transforms = {
    $document: {
        fromDB: document => document,
        toDB: (document, property, model) => {
            Object.keys(document).forEach(key => {
                if(!model.schema.hasOwnProperty(key)) delete document[key];
            });
            
            return document;
        }
    }
};
```