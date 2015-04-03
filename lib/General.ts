export interface Callback<T> {
    (err: Error, object: T): void;
}

export interface Predicate<T> {
    (object: T, key?: string): boolean;
}