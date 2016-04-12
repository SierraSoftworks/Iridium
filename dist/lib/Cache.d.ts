export interface Cache {
    set<T>(key: string, value: T): void;
    get<T>(key: string): Promise<T>;
    clear(key: string): void;
}
