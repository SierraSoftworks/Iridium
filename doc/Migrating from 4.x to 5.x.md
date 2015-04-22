# Migrating from v4.x to v5.x
There have been some major architectural changes to Iridium between v4.x and v5.x - most significant being the switch
to TypeScript over JavaScript. This serves two primary purposes, the first being that we can finally provide true
IntelliSense support without having to hack around the limitations of individual editors, and the second being that
both Iridium and applications you write which make use of it are far less likely to contain errors as a result of
poor API usage.

Part of this transition required changes to the way certain things are handled by Iridium, those changes are detailed
in the [Architectural Changes](#architectural_changes) section.

## First things first
This isn't a small update (like the one from v2.x to v3.x or v3.x to v4.x) and will **definitely** require changes to your application
if you wish to make use of it. We will be supporting the 3.x branch for a short time, providing bug and security fixes
as necessary, however new features will not be backported.

We recommend that you **do not upgrade existing applications** to the 4.x branch unless you've got a lot of time on your
hands or are using TypeScript already. If however you are set on doing so, you will need to change the following things.

## Architectural Changes
The biggest change between v4.x and v5.x is that Iridium is now primarily developed in TypeScript. Yes, you read that
correctly, [TypeScript](http://www.typescriptlang.org). I'll be perfectly honest with you, it was my intention to do
so from the get go but when I started Iridium it simply wasn't mature enough (v0.9 at the time) to support many of the
features I wanted to implement.

With the latest version of TypeScript (v1.4) the building blocks were finally available and so I set about rewriting
Iridium the way I wanted to write it initially. This has meant a couple of changes to the way you do certain things
which you may like or dislike depending on how you decide to use Iridium.

The biggest difference is that the `Instance` type which used to wrap documents to provide methods such as `save()`
has now been decoupled from the `Model` type (which wraps a MongoDB collection). This means that it is now possible
to develop your own custom instance types to replace Iridum's default one if you wish, but it also is the result of
a change in the way Models are defined.

In Iridium v4.x you would define a model's properties and methods through the options object like this:

```javascript
var model = new Iridium.Model(core, 'collection', {
    id: false,
    fullname: String
}, {
    methods: {
        jump: function() { }
    },
    virtuals: {
        avatar: function() { },
        password: {
            get: function() { },
            set: function(value) { }
        }
    }
});
```

This worked well from a JavaScript perspective but made it incredibly difficult for your IDE to figure out what was
going on. For starters, the `avatar()` function's `this` at design time would point to the `virtuals: {}` object
and there was no tangible relationship between the created instances and the methods, virtuals or properties defined
in the model.

In Iridium v5.x we've changed things up a bit, using TypeScript generics you can now specify an interface which describes
the documents present in the collection, as well as a class which will be used to wrap those documents. It's actually
easier than you'd think since Iridium provides a number of useful helpers.

```typescript
interface CollectionDocument {
    id: string;
    fullname: string;
}

class CollectionInstance extends Iridium.Instance<CollectionDocument, CollectionInstance> {
    id: string;
    fullname: string;
    jump() { }
    get avatar() { }
    get password() { }
    set password() { }
}

var model = new Iridium.Model<CollectionDocument, CollectionInstance>(core, CollectionInstance, 'collection', {
    id: false,
    fullname: String
});
```

So, what's changed? Well, we've defined an interface which describes our collection documents - this allows your IDE
to provide contextual completion on any method which expects a document property.
So `model.create({ id: 'test', fullname: 'Test User' })` for example will provide hints for `id` and `fullname` - making
your life significantly easier.

We've also defined a class called `CollectionInstance` which extends the default Iridium Instance type (to gain `save()`
and friends) which is then passed into our model's constructor in the `instanceType` field. From there on everything is
pretty much identical to Iridium 4.x - with the obvious removal of the `methods` and `virtuals` options since they are
no longer required.

The best part is, you still get to keep all the same great performance you got with Iridium 4.x - with a massive boost
in developer productivity as a result of having inline assistance from your IDE.
