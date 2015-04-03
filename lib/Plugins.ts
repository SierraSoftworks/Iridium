/// <reference path='../typings/skmatc/skmatc.d.ts' />

import core = require('./Core');
import model = require('./Model');
import instance = require('./Instance');

export = IPlugin;

interface IPlugin {
    newModel?(model: model.IModel<any, any>);
    newInstance? (instance: instance.IInstance<any, any>, model: model.IModelBase);
    validate? : SkmatcCore.IValidationHandler | [SkmatcCore.IValidationHandler];
}