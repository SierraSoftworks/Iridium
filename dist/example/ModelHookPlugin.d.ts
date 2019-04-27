import Iridium = require("../iridium");
declare class LowercaseCollectionsPlugin implements Iridium.Plugin {
    newModel(model: Iridium.Model<any, any>): void;
}
export = LowercaseCollectionsPlugin;
