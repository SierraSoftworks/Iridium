/// <reference path="../_references.d.ts" />
import {Core} from './Core';

/**
 * Middlewares provided by Iridium, such as the Express one, derive from this interface.
 * @internal
 */
export interface MiddlewareFactory<T> {
    (core: Core): T;
}