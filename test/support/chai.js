/// <reference path="../../_references.d.ts" />
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiFuzzy = require('chai-fuzzy');
chai.use(chaiAsPromised);
chai.use(chaiFuzzy);
global.chai = chai;
global.expect = chai.expect;
//# sourceMappingURL=chai.js.map