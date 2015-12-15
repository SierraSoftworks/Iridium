var MongoDB = require('mongodb');
exports.DefaultTransforms = {
    ObjectID: {
        fromDB: function (value) { return value instanceof MongoDB.ObjectID ? value.toHexString() : value; },
        toDB: function (value) { return typeof value === 'string' ? new MongoDB.ObjectID(value) : value; }
    },
    Binary: {
        fromDB: function (value) {
            if (!value)
                return null;
            if (value instanceof MongoDB.Binary)
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
