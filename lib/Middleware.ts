/// <reference path="../_references.d.ts" />
import Core = require('./Core');

export = IMiddlewareFactory;
interface IMiddlewareFactory<T> {
    (core: Core): T;
}