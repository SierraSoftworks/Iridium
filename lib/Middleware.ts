import Core = require('./Core');

export = IMiddlewareFactory;
interface IMiddlewareFactory<T> {
    (core: Core): T;
}