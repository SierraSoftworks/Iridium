var Iridium = require('../../index.js'),
    config = require('./config.json'),
    Concoction = require('concoction');;

global.Iridium = global.Database = Iridium;
global.Model = Iridium.Model;
global.Instance = Iridium.Instance;
global.Concoction = Concoction;
global.config = config;