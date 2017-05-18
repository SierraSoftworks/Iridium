import Iridium = require("../iridium");

class LowercaseCollectionsPlugin implements Iridium.Plugin {
    newModel(model: Iridium.Model<any, any>) {
        model.collectionName = model.collectionName.toLowerCase();
    }
}

export = LowercaseCollectionsPlugin;