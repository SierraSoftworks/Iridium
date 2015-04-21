import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import chaiFuzzy = require('chai-fuzzy');
import Promise = require('bluebird');

chai.use(chaiAsPromised);
chai.use(chaiFuzzy);

global.chai = chai;
global.expect = chai.expect;