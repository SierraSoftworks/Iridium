"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sourceMapSupport = require("source-map-support");
Bluebird.config({
    longStackTraces: true
});
global.Promise = Bluebird;
sourceMapSupport.install({
    handleUncaughtExceptions: false
});
chai.use(chaiAsPromised);
//# sourceMappingURL=chai.js.map