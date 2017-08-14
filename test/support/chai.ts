import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sourceMapSupport from "source-map-support";

sourceMapSupport.install({
    handleUncaughtExceptions: false
});

chai.use(chaiAsPromised);