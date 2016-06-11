"use strict";
const BSON_1 = require("./BSON");
exports.DefaultTransforms = {
    ObjectID: {
        fromDB: value => value instanceof BSON_1.ObjectID ? value.toHexString() : value,
        toDB: value => typeof value === "string" ? new BSON_1.ObjectID(value) : value
    },
    Binary: {
        fromDB: value => {
            if (!value)
                return null;
            if (value instanceof BSON_1.Binary)
                return value.buffer;
            return value;
        },
        toDB: value => {
            if (Buffer.isBuffer(value))
                return new BSON_1.Binary(value);
            if (Array.isArray(value))
                return new BSON_1.Binary(new Buffer(value));
            return null;
        }
    }
};
//# sourceMappingURL=Transforms.js.map