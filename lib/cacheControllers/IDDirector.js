var IDCacheDirector = (function () {
    function IDCacheDirector() {
    }
    IDCacheDirector.prototype.valid = function (object) {
        return object._id;
    };
    IDCacheDirector.prototype.buildKey = function (object) {
        return JSON.stringify(object._id);
    };
    return IDCacheDirector;
})();
module.exports = IDCacheDirector;
//# sourceMappingURL=IDDirector.js.map