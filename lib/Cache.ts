export interface Cache {
    set<T>(key: string, value: T): void;
    get<T>(key: string): PromiseLike<T>;
    clear(key: string): void
}