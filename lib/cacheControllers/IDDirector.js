var MongoDB = require('mongodb');
var IDCacheDirector = (function () {
    function IDCacheDirector() {
    }
    IDCacheDirector.prototype.valid = function (object) {
        return !!object._id;
    };
    IDCacheDirector.prototype.buildKey = function (object) {
        if (object._id._bsontype == 'ObjectID')
            return new MongoDB.ObjectID(object._id.id).toHexString();
        return object._id;
    };
    IDCacheDirector.prototype.validQuery = function (conditions) {
        return !!conditions._id;
    };
    IDCacheDirector.prototype.buildQueryKey = function (conditions) {
        if (conditions._id._bsontype == 'ObjectID')
            return new MongoDB.ObjectID(conditions._id.id).toHexString();
        return conditions._id;
    };
    return IDCacheDirector;
})();
module.exports = IDCacheDirector;
//# sourceMappingURL=IDDirector.js.map