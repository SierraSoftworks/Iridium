/// <reference path="../_references.d.ts" />
export interface Callback<T> {
    (err: Error, object?: T): void;
}

export interface Predicate<T> {
    (object: T, key?: string): boolean;
}

export interface PropertyGetter<T> {
    (): T;
}

export interface PropertySetter<T> {
    (value: T): void;
}

export interface Property<T> {
    get?: PropertyGetter<T>;
    set?: PropertySetter<T>;
}