import Iridium = require("../iridium");

export = LowercaseCollectionsPlugin;

class LowercaseCollectionsPlugin implements Iridium.Plugin {
    newModel(model: Iridium.Model<any, any>) {
        model.collectionName = model.collectionName.toLowerCase();
    }
}