# Iridium
**A High Performance, IDE Friendly ODM for MongoDB**

[![NPM Module](https://badge.fury.io/js/iridium.png)](https://npmjs.org/package/iridium)
[![Build Status](https://travis-ci.org/SierraSoftworks/Iridium.png?branch=master)](https://travis-ci.org/SierraSoftworks/Iridium)
[![Coverage Status](https://coveralls.io/repos/SierraSoftworks/Iridium/badge.svg?branch=master)](https://coveralls.io/r/SierraSoftworks/Iridium?branch=typescript)
[![Code Climate](https://codeclimate.com/github/SierraSoftworks/Iridium/badges/gpa.svg)](https://codeclimate.com/github/SierraSoftworks/Iridium)
[![Test Coverage](https://codeclimate.com/github/SierraSoftworks/Iridium/badges/coverage.svg)](https://codeclimate.com/github/SierraSoftworks/Iridium)


Iridium is designed to offer a high performance, easy to use and above all, editor friendly ODM for MongoDB on Node.js.
Rather than adopting the "re-implement everything" approach often favoured by ODMs like Mongoose and friends, requiring
you to learn an entirely new API and locking you into a specific coding style, Iridium tries to offer an incredibly
lightweight implementation which makes your life easier where it counts and gets out of your way when you want to do
anything more complex.

## Using Iridium
Rather than opt of the usual "Look how quickly you can do something" approach, we thought it might be useful to see
an example which covers most of the stuff you'd need to do in Iridium. This example covers defining your own document
interfaces, a custom schema and instance type which provides some additional methods.

You'll notice that the `House` class extends Iridium's `Instance` class, which gives it methods like `save()` as well
as change tracking when calling `save()` on the instance. If you'd prefer a lighter approach or to use your own home-grown
implementation then you can do so by taking a look at the [Custom Instances](#custom-instances) section.

```typescript
/// <reference path="node_modules/iridium/index.d.ts" />
import Iridium = require('iridium');

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
    
    cars: Car[];
}

class House extends Iridium.Instance<HouseDocument, House> implements HouseDocument {
    _id?: string;
    name: string;
    
    cars: Car[];
    
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

var HouseSchema: Iridium.Schema = {
    _id: false,
    name: String,
    cars: [{
        make: String,
        model: String,
        colour: { r: Number, g: Number, b: Number }
    }]
};

var HouseOptions: Iridium.ModelOptions = {
    indexes: [
        { name: 1 }
    ]
};

class MyDatabase extends Iridium.Core {
    Houses = new Iridium.Model<HouseDocument, House>(this, House, 'houses', HouseSchema, HouseOptions);
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