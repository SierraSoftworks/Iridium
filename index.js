/// <reference path="nodelib/node.js"/>
/// <reference path="lib/Database.js"/>
var Database = require('./lib/Database');
var Concoction = require('concoction');

Database.Concoction = Concoction;

(require.modules || {}).iridium = (require.modules || {}).index = module.exports = Database;