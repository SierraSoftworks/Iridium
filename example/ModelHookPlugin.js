var LowercaseCollectionsPlugin = (function () {
    function LowercaseCollectionsPlugin() {
    }
    LowercaseCollectionsPlugin.prototype.newModel = function (model) {
        model.collectionName = model.collectionName.toLowerCase();
    };
    return LowercaseCollectionsPlugin;
})();
module.exports = LowercaseCollectionsPlugin;
//# sourceMappingURL=ModelHookPlugin.js.map