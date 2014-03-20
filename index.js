var Database = require('./lib/Database');
var Concoction = require('concoction');

Database.Concoction = Concoction;

(require.modules || {}).iridium = (require.modules || {}).index = module.exports = Database;