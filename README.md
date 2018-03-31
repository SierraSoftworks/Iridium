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
Iridium is built on top of a number of very modern technologies, including TypeScript 2.8, JavaScript ES6 and the latest MongoDB
Node.js Driver (version 3.0). You'll need to be running Node.js 6.x run version 8 of Iridium.

For starters, you will need to be running MongoDB 2.6 or later in order to use Iridium - however we recommend you use MongoDB 3.1
due to the various performance improvements they've made. If you're working with TypeScript, you will also need to use the 2.8
compiler or risk having the Iridium type definitions break your project.

## Using Iridium
Rather than opt of the usual "Look how quickly you can do something" approach, we thought it might be useful to see
an example which covers most of the stuff you'd need to do in Iridium. We're going to put together a small database
example which takes advantage of nested objects, transforms, renames and some other nice features offered by Iridium.

**If you're looking for Iridium's API documentation, then you can find that [here](http://sierrasoftworks.github.io/Iridium).**

### Example Description
Our example is a simple database which stores the list of cars that individual drivers own and describes those cars
with a `make`, `model` and `colour`. For the sake of showing off some of Iridium's more complex features, we're being
overly verbose in how we implement some components, however you'll often find that the simpler examples (like `Address`)
work perfectly for most use cases.

### Example Components

#### The `Colour` object
The `colour` object is used in our DB to represent the colour of a car.
While we could use a simple interface and schema, we have opted to include
a custom class as well so that we can provide application-level methods to
represent it as a hex string (for example).

In many cases you won't have need for this and a simple schema+interface
will suffice. Take a look at the `Address` object for an example of how that
can be done.

```typescript
/**
 * Schemas are used to provide automatic data validation before you
 * save stuff to the database. We are using a custom "ubyte" validator
 * which we define on our model later.
 */
const ColourSchema = {
    r: "ubyte",
    g: "ubyte",
    b: "ubyte"
}

/**
 * We also define a document interface which describes how the
 * colour is stored in the database.
 */
interface ColourDoc {
    r: number;
    g: number;
    b: number;
}

/**
 * The Colour class is then used within our application to describe
 * a colour. It provides useful utility functions that our app will
 * utilize to perform its duties.
 */
class Colour {
    constructor(doc: ColourDoc) {
        this.r = doc.r
        this.g = doc.g
        this.b = doc.b
    }

    r: number;
    g: number;
    b: number;

    /**
     * The toDB() method is used to convert this class back into a DB document
     */
    toDB(): ColourDoc {
        return {
            r: this.r,
            g: this.g,
            b: this.b
        }
    }

    toString() {
        return `#${this.toHex(this.r)}${this.toHex(this.g)}${this.toHex(this.b)}`
    }

    /**
     * Who needs left-pad?
     */
    private toHex(num: number, padding = 2) {
        let hex = num.toString(16)
        while (hex.length < 2)
            hex = `0${hex}`
        return hex
    }
}
```

#### The `Car` object
Our `car` object shows how you can nest DB objects with the `toDB()` method
and their constructors. It also shows how you can implement helpful methods
on these classes to make writing code with them easier.

```typescript
const CarSchema = {
    make: String,
    model: String,
    colour: ColourSchema
}

interface CarDoc {
    make: string
    model: string
    colour: ColourDoc
}

class Car {
    constructor(doc: CarDoc) {
        this.make = doc.make
        this.model = doc.model
        this.colour = new Colour(doc.colour)
    }

    make: string;
    model: string;
    colour: Colour;

    repaint(r: number, g: number, b: number) {
        this.colour = new Colour({ r, g, b })
    }

    toDB(): CarDoc() {
        return {
            make: this.make,
            model: this.model,
            colour: this.colour.toDB()
        }
    }
}
```

#### The `Address` object
In this case, we don't need anything complex to represent
an address or to interact with it, so we're just going to
use a basic schema and interface to describe it - no need
for fancy classes or transforms.

```typescript
const AddressSchema = {
    // Address lines, at least one and no more than 3
    lines: [String, 1, 3],
    country: String
}

interface AddressDoc {
    lines: string[];
    country: string;
}
```

#### The `Driver` model
Here is where we start interacting with Iridium. We're defining a model's Instance type
which is the class that Iridium will use to represent a DB document. Unlike many other
ORMs/ODMs, Iridium allows you to implement your own instance type if you so desire and
simply provides a useful base class for your average use case. You can find out more
about the methods that [`Iridium.Instance`](http://sierrasoftworks.github.io/Iridium/classes/instance.html)
provides by reading the [API Documentation](http://sierrasoftworks.github.io/Iridium/classes/instance.html).

In this example we are leveraging that default base class and using Iridium's various
`@decorators` to configure things like our indexes, schema validation rules, transforms
and renames. You can also bypass these decorators and use static fields on the instance
type itself if you prefer, however the decorators are usually a nicer way to manage things.

```typescript
import * as Iridium from 'iridium';
import {ObjectId} from "mongodb";

// The DriverDocument describes the format of our database
// document.
interface DriverDocument {
    _id?: ObjectId;
    name: string;
    address: AddressDoc;

    // We want to let people create a driver without specifying
    // their cars, so we make this optional.
    cars?: CarDoc[];
}

// Finding a driver by name turns out to be a really common use case,
// so we've added an index on that field to reduce the number of full
// collection scans performed by our app.
@Iridium.Index({ name: 1 })

// Let's also add an index on the cars that someone owns so that we can
// quickly find out who drives that black Audi...
@Iridium.Index({ "cars.model": 1, "cars.make": 1 }, { background: true })

// Driver objects should be stored in the `drivers` collection in our DB
@Iridium.Collection('drivers')

// We want to add support for our "ubyte" custom datatype to the validation
// engine, so we'll do that here.
@Iridium.Validate("ubyte", (value) => {
    return this.assert(
        typeof value === "number"
            && value >= 0
            && value < 255
            && Math.floor(value) === value,
        "Should be an integer between 0 and 255"
    )
})
class Driver extends Instance<DriverDocument, Driver> {
    // We'd prefer to work with a string ObjectID, so ask Iridium to take
    // care of converting it for us.
    @Iridium.ObjectID
    _id: string;

    // We'd like to force drivers to have very specific types of names,
    // in this case, only westernized names like J.P. Pietersen or Bob McAffee.
    @Iridium.Property(/^[A-Z][\w\-\.]*(\s[A-Z][\w\-\.])+/)

    // Our DB originally called this full_name, so we're renaming it
    // here for backwards compatibility, but we really prefer working
    // with `name` in the app.
    @Iridium.Rename("full_name")
    name: string;

    // This is a really simple nested document which doesn't use transforms
    // or classes.
    @Iridium.Property(AddressSchema)
    address: AddressDoc;

    // We have a list of cars that each driver owns. The schema is an array of
    // CarSchema objects, which we defined above.
    @Property([CarSchema])
    // We also want Iridium to automatically transform our DB's CarDoc objects into
    // our much more useful Car class, but also be smart about putting the values back
    // into the DB in the right format.
    @Iridium.TransformClassList(Car)
    cars: Car[];

    // When we first create a Driver document we would like to make sure that cars
    // is defined, but empty, so we use this onCreating hook to achieve that.
    static onCreating(doc: HouseDocument) {
        doc.cars = doc.cars || [];
    }

    // We'd like to quickly be able to add a car to a driver without needing to
    // manually instantiate the object, so we've provided this nice helper method.
    addCar(make: string, model: string, colour: Colour) {
        this.cars.push(new Car({
            make: make,
            model: model,
            colour: colour.toDB()
        }));
    }

    // We also would like to be able to access a driver's `numberOfCars` by a nice
    // alias, so we've added a getter for that.
    get numberOfCars() {
        return this.cars.length;
    }
}
```

#### Example `Core` implementation
Once we've defined all of our model types, it's time to define our database connection
class. To do so, simply extend Iridium's [`Core`](http://sierrasoftworks.github.io/Iridium/classes/core.html)
class and register your DB models there.

This pattern is, as with every other aspect of Iridium, optional and if you prefer you can
simply instantiate a new [`Iridium.Core`](http://sierrasoftworks.github.io/Iridium/classes/core.html)
and manage your models separately. This might make more sense for applications which use
Dependency Injection and are interested in de-coupling their models.

```typescript
import * as Iridium from 'iridium';

class MyDatabase extends Core {
    Drivers = new Model<DriverDocument, Driver>(this, Driver);

    // We've got a few housekeeping tasks we'd like to take
    // care of automatically when we start our database connection,
    // so we use the `onConnected` hook to run them.
    protected onConnected() {
        return super.onConnected().then(() => Promise.all([
            // One of those tasks is creating all our indexes
            // for the Drivers collection.
            this.Drivers.ensureIndexes(),
            this.seed()
        ]))
    }

    // This is our own custom method which we call from the onConnected hook
    // to seed the DB with some example data.
    protected seed() {
        return this.Drivers.count().then(count => {
            if (!count)
                return this.Drivers.insert({
                    name: "Example Driver",
                    cars: [{
                        make: 'Audi',
                        model: 'A4',
                        colour: { r: 0, g: 0, b: 0 }
                    }]
                })
        })
    }
}
```

#### Example Application
When you have defined all of your database components, you'll probably want to use it.
To do so, simply instantiate your `MyDatabase` type and provide the connection configuration
for your environment; call `connect()` and then do whatever you need to do.

For more information on the various connection options you can provide, take a look
at the [API documentation](http://sierrasoftworks.github.io/Iridium/interfaces/configuration.html).

```typescript
var myDb = new MyDatabase({ database: 'drivers_test' });

myDb.connect()
    .then(() => myDb.Drivers.get({ name: "Example Driver" }))
    .then((driver) => {
        driver.addCar('Audi', 'S4', { r: 255, g: 255, b: 255 });
        return driver.save();
    })
    .then(() => myDb.close());
```
