export = ICacheDirector;

interface ICacheDirector {
    valid<T>(object: T): boolean;
    buildKey<T>(object: T): string;
}