# Iridium
**A High Performance, IDE Friendly ODM for MongoDB**

[![NPM Module](https://badge.fury.io/js/iridium.svg)](https://npmjs.org/package/iridium)
[![Build Status](https://travis-ci.org/SierraSoftworks/Iridium.svg?branch=master)](https://travis-ci.org/SierraSoftworks/Iridium)
[![Coverage Status](https://coveralls.io/repos/SierraSoftworks/Iridium/badge.svg?branch=master)](https://coveralls.io/r/SierraSoftworks/Iridium?branch=typescript)
[![Code Climate](https://codeclimate.com/github/SierraSoftworks/Iridium/badges/gpa.svg)](https://codeclimate.com/github/SierraSoftworks/Iridium)
[![Test Coverage](https://codeclimate.com/github/SierraSoftworks/Iridium/badges/coverage.svg)](https://codeclimate.com/github/SierraSoftworks/Iridium)


Iridium is designed to offer a high performance, easy to use and above all, editor friendly ODM for MongoDB on Node.js.
Rather than adopting the "re-implement everything" approach often favoured by ODMs like Mongoose and friends, requiring
you to learn an entirely new API and locking you into a specific coding style, Iridium tries to offer an incredibly
lightweight implementation which makes your life easier where it counts and gets out of your way when you want to do
anything more complex.

It also means that, if you're familiar with the MongoDB CLI you should find working with Iridium very natural, with all database
methods returning promises for their results and sensible, type annotated results being provided if you wish to make use of them.

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

## Requirements
Iridium is built on top of a number of very modern technologies, including TypeScript 1.5, JavaScript ES6 (though we do compile
to ES5 for compatibility with existing Node.js implementations) and the latest MongoDB Node.js Driver (version 2.0).

For starters, you will need to be running MongoDB 2.6 or later in order to use Iridium - however we recommend you use MongoDB 3.0
due to the various performance improvements they've made. If you're working with TypeScript, you will also need to use the 1.5
compiler or risk having the Iridium type definitions break your project.

## Using Iridium
Rather than opt of the usual "Look how quickly you can do something" approach, we thought it might be useful to see
an example which covers most of the stuff you'd need to do in Iridium. This example covers defining your own document
interfaces, a custom schema and instance type which provides some additional methods.

You'll notice that the `House` class extends Iridium's `Instance` class, which gives it methods like `save()` as well
as change tracking when calling `save()` on the instance. If you'd prefer a lighter approach or to use your own home-grown
implementation then you can do so by taking a look at the [Custom Instances](#custom-instances) section.

```typescript
/// <reference path="node_modules/iridium/index.d.ts" />
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
rule.

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

### Custom Instances
If you decide to implement your own instance constructor then this is the part you'll be interested in.
