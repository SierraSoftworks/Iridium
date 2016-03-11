/// <reference path="../../typings/DefinitelyTyped/tsd.d.ts" />
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import Bluebird = require("bluebird");

Bluebird.longStackTraces();

chai.use(chaiAsPromised);

global.chai = chai;
global.expect = chai.expect;