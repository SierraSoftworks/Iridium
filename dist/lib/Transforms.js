var MongoDB = require('mongodb');
exports.DefaultTransforms = {
    ObjectID: {
        fromDB: function (value) { return value && value._bsontype == 'ObjectID' ? new MongoDB.ObjectID(value.id).toHexString() : value; },
        toDB: function (value) { return value && typeof value === 'string' ? new MongoDB.ObjectID(value) : value; }
    },
    Binary: {
        fromDB: function (value) {
            if (!value)
                return null;
            if (value._bsontype === "Binary")
                return value.buffer;
            return value;
        },
        toDB: function (value) {
            if (Buffer.isBuffer(value))
                return new MongoDB.Binary(value);
            if (Array.isArray(value))
                return new MongoDB.Binary(new Buffer(value));
            return null;
        }
    }
};

//# sourceMappingURL=Transforms.js.map
