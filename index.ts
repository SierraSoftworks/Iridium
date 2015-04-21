/// <reference path="./lib/Core.ts" />
/// <reference path="./lib/Model.ts" />

import _Core = require('./lib/Core');
import _Model = require('./lib/Model');
import _Instance = require('./lib/Instance');
import _Schema = require('./lib/Schema');

export = Iridium;

module Iridium {
    export class Core extends _Core { };
    export class Model<TDocument, TInstance> extends _Model.Model<TDocument, TInstance> { };
    export class Instance<TDocument, TInstance> extends _Instance<TDocument, TInstance> { };
    export interface Schema extends _Schema { };
};