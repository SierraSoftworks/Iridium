var MongoDB = require('mongodb');
exports.DefaultTransforms = {
    ObjectID: {
        fromDB: function (value) { return value && value._bsontype == 'ObjectID' ? new MongoDB.ObjectID(value.id).toHexString() : value; },
        toDB: function (value) { return value && typeof value === 'string' ? new MongoDB.ObjectID(value) : value; }
    },
    Binary: {
        fromDB: function (value) {
            if (!value)
                return new Buffer(0);
            if (value._bsontype === "Binary") {
                var binary = new MongoDB.Binary(value);
                return binary.read(0, binary.length());
            }
            return new Buffer(0);
        },
        toDB: function (value) {
            if (!value)
                value = new Buffer(0);
            else if (Array.isArray(value))
                value = new Buffer(value);
            if (value && Buffer.isBuffer(value))
                return new MongoDB.Binary(value);
            return null;
        }
    }
};

//# sourceMappingURL=Transforms.js.map
