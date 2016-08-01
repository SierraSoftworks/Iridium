import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as Bluebird from "bluebird";
import * as sourceMapSupport from "source-map-support";

Bluebird.longStackTraces();
sourceMapSupport.install({
    handleUncaughtExceptions: false
});

chai.use(chaiAsPromised);