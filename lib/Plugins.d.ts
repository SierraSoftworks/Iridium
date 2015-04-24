/// <reference path="../_references.d.ts" />
import model = require('./Model');
export = IPlugin;
interface IPlugin {
    newModel?(model: model.IModel<any, any>): any;
    newInstance?(instance: any, model: model.IModelBase): any;
    validate?: SkmatcCore.IValidator | SkmatcCore.IValidator[];
}
