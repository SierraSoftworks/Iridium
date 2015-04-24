/// <reference path="_references.d.ts" />
import _Core = require('./lib/Core');
import _Model = require('./lib/Model');
import _Instance = require('./lib/Instance');
import _Schema = require('./lib/Schema');
export = Iridium;
declare module Iridium {
    class Core extends _Core {
    }
    class Model<TDocument, TInstance> extends _Model.Model<TDocument, TInstance> {
    }
    class Instance<TDocument, TInstance> extends _Instance<TDocument, TInstance> {
    }
    interface Schema extends _Schema {
    }
}
