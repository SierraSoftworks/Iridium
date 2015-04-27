/// <reference path="../../_references.d.ts" />
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import Bluebird = require('bluebird');
var chaiFuzzy = require('chai-fuzzy');

Bluebird.longStackTraces();

chai.use(chaiAsPromised);
chai.use(chaiFuzzy);

global.chai = chai;
global.expect = chai.expect;