var Database = require('./lib/Database.js');
var Concoction = require('concoction');

Database.Concoction = Concoction;

(require.modules || {}).iridium = (require.modules || {}).index = module.exports = Database;