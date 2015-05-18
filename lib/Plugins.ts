/// <reference path="../_references.d.ts" />
import core = require('./Core');
import ModelInterfaces = require('./ModelInterfaces');
import instance = require('./Instance');

export = IPlugin;

interface IPlugin {
    newModel? (model: ModelInterfaces.IModel<any, any>);
    newInstance? (instance: any, model: ModelInterfaces.IModelBase);
    validate?: SkmatcCore.IValidator | SkmatcCore.IValidator[];
}