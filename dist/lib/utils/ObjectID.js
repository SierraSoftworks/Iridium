/// <reference path="../../_references.d.ts" />
var MongoDB = require('mongodb');
function toObjectID(value) {
    return MongoDB.ObjectID.createFromHexString(value);
}
exports.toObjectID = toObjectID;

//# sourceMappingURL=../../lib/utils/ObjectID.js.map