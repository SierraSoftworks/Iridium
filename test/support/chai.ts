import * as Bluebird from "bluebird";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sourceMapSupport from "source-map-support";

Bluebird.config({
    longStackTraces: true
})

global.Promise = Bluebird;

sourceMapSupport.install({
    handleUncaughtExceptions: false
});

chai.use(chaiAsPromised);