/// <reference path="./lib/Core.ts" />
/// <reference path="./lib/Model.ts" />

import Core = require('./lib/Core');
import Model = require('./lib/Model');

export = Iridium;

class Iridium extends Core {

    static get Model() { return Model.Model; }
}