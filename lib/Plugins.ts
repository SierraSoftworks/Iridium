/// <reference path="../_references.d.ts" />
import core = require('./Core');
import * as ModelInterfaces from './ModelInterfaces';

export interface Plugin {
    newModel? (model: ModelInterfaces.IModel<any, any>);
    newInstance? (instance: any, model: ModelInterfaces.IModelBase);
    validate?: Skmatc.Validator | Skmatc.Validator[];
}