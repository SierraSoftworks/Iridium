import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import Promise = require('bluebird');
var chaiFuzzy = require('chai-fuzzy');

chai.use(chaiAsPromised);
chai.use(chaiFuzzy);

global.chai = chai;
global.expect = chai.expect;