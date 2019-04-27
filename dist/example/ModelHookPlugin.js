"use strict";
class LowercaseCollectionsPlugin {
    newModel(model) {
        model.collectionName = model.collectionName.toLowerCase();
    }
}
module.exports = LowercaseCollectionsPlugin;
//# sourceMappingURL=ModelHookPlugin.js.map