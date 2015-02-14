var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiFuzzy = require('chai-fuzzy');
var Promise = require('bluebird');

var should = chai.should();
chai.use(chaiAsPromised);
chai.use(chaiFuzzy);

global.chai = chai;
global.should = should;
global.Promise = Promise;