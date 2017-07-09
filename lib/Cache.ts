export interface Cache {
    set<T>(key: string, value: T): PromiseLike<T>;
    get<T>(key: string): PromiseLike<T>;
    clear(key: string): PromiseLike<boolean>;
}