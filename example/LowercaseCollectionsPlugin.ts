import Iridium = require('../index');
import Model = require('../lib/Model');
import IPlugin = require("../lib/Plugins");

export = LowercaseCollectionsPlugin;

class LowercaseCollectionsPlugin implements IPlugin {
    newModel(model: Model.IModel<any, any>) {
        model.collectionName = model.collectionName.toLowerCase();
    }
}