export interface Cache {
    set<T>(key: string, value: T): void;
    get<T>(key: string): PromisesAPlus.Thenable<T>;
    clear(key: string): void
}