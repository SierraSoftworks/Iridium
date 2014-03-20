var Database = require('iridium'),
    skmatc = require('skmatc');

var Plugin = {
	validate: [
        skmatc.Validator.module(function(schema) {
            return schema == "Uppercase";
        }, function(schema, data, path) {
            return this.assert(value.toUpperCase() == value);
        }),
        skmatc.Validator.module(function(schema) {
            return schema == "Lowercase";
        }, function(schema, data, path) {
            return this.assert(value.toLowerCase() == value);
        })]
};

module.exports = Plugin;