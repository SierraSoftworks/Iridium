/// <reference path="../_references.d.ts" />
import {Core} from './Core';

export interface MiddlewareFactory<T> {
    (core: Core): T;
}