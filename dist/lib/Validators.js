"use strict";
var MongoDB = require('mongodb');
var Skmatc = require('skmatc');
function DefaultValidators() {
    return [
        Skmatc.create(function (schema) { return schema === MongoDB.ObjectID; }, function (schema, data) {
            return this.assert(!data || data instanceof MongoDB.ObjectID || (data._bsontype === 'ObjectID' && data.id), "Expected " + JSON.stringify(data) + " to be a valid MongoDB.ObjectID object");
        }, { name: 'ObjectID validation' }),
        Skmatc.create(function (schema) { return schema === Buffer; }, function (schema, data) {
            return this.assert(data && (data instanceof MongoDB.Binary || (data._bsontype === 'Binary' && data.buffer)), "Expected " + JSON.stringify(data) + " to be a valid MongoDB.Binary object");
        }, { name: 'Buffer validation' })
    ];
}
exports.DefaultValidators = DefaultValidators;

//# sourceMappingURL=Validators.js.map
