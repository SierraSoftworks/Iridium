"use strict";
var BSON_1 = require("./BSON");
exports.DefaultTransforms = {
    ObjectID: {
        fromDB: function (value) { return value instanceof BSON_1.ObjectID ? value.toHexString() : value; },
        toDB: function (value) { return typeof value === "string" ? new BSON_1.ObjectID(value) : value; }
    },
    Binary: {
        fromDB: function (value) {
            if (!value)
                return null;
            if (value instanceof BSON_1.Binary)
                return value.buffer;
            return value;
        },
        toDB: function (value) {
            if (Buffer.isBuffer(value))
                return new BSON_1.Binary(value);
            if (Array.isArray(value))
                return new BSON_1.Binary(new Buffer(value));
            return null;
        }
    }
};
//# sourceMappingURL=Transforms.js.map