/// <reference path='../typings/bluebird/bluebird.d.ts' />

import instance = require('./Instance');

export interface IHooks<TSchema> {
    creating?(document: any);
    retrieved?(document: any);
    ready?(instance: instance.IInstance<any, any> | any);
    beforeSave?(instance: instance.IInstance<any, any>);
}