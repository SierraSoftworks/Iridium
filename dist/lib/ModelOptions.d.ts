import * as Index from "./Index";
/**
 * Options which can be used to control the way in which a query is executed
 * against the MongoDB database.
 */
export interface QueryOptions {
    cache?: boolean;
    fields?: {
        [name: string]: number;
    };
    limit?: number;
    skip?: number;
    sort?: Index.IndexSpecification;
}
/**
 * Options which can be used to control the way in which a document is created
 * on the MongoDB server.
 */
export interface CreateOptions {
    /**
     * The write concern, can either be a number from 0 to the number of nodes within
     * the cluster, or "majority" if you would like to wait for the majority of nodes
     * within the cluster to confirm the write before returning.
     *
     * It is recommended that you set this to "majority", however in all situations
     * where you mind if data is lost, you should set it to at least 1.
     */
    w?: string | number;
    /**
     * The timeout in milliseconds before the write will be aborted by the MongoDB server
     * and an error response (if the write concern is non-zero) is returned to the client.
     */
    wtimeout?: number;
    /**
     * Whether to wait for the write to be commited to the server's journal (flushed to disk)
     * or not. By specifying 1 here, you imply w:1 - howver this can be combined with w:"majority"
     * to give excellent write reliability within a cluster, even across failures.
     */
    j?: number;
    /**
     * Whether or not to serialize JavaScript functions which are provided as values. For security
     * reasons it is probably best to set this to false, however it may come in handy under certain
     * circumstances.
     */
    serializeFunctions?: boolean;
    /**
     * Whether to generate document ObjectIDs within the client library or on the server, it is recommended
     * that you leave this to default (false) unless you are making thousands of inserts per second from
     * a single node and experiencing _id collisions.
     */
    forceServerObjectId?: boolean;
    /**
     * Whether to perform an upsert operation if the document already exists.
     */
    upsert?: boolean;
    /**
     * Whether to store the resulting document in the Iridium document cache to boost later retrieval times.
     */
    cache?: boolean;
}
export interface UpdateOptions {
    /**
     * The write concern, can either be a number from 0 to the number of nodes within
     * the cluster, or "majority" if you would like to wait for the majority of nodes
     * within the cluster to confirm the write before returning.
     *
     * It is recommended that you set this to "majority", however in all situations
     * where you mind if data is lost, you should set it to at least 1.
     */
    w?: string | number;
    /**
     * The timeout in milliseconds before the write will be aborted by the MongoDB server
     * and an error response (if the write concern is non-zero) is returned to the client.
     */
    wtimeout?: number;
    /**
     * Whether to wait for the write to be commited to the server's journal (flushed to disk)
     * or not. By specifying 1 here, you imply w:1 - howver this can be combined with w:"majority"
     * to give excellent write reliability within a cluster, even across failures.
     */
    j?: boolean;
    /**
     * Whether to perform an upsert operation if the document already exists. This can be combined
     * with $setOnInsert to automatically create documents which do not exist in the database prior
     * to making changes - and can be very handy for high-throughput systems.
     */
    upsert?: boolean;
    /**
     * Whether to update multiple documents at once, defaults to false unless run using a method
     * which explcitly sets it to true.
     */
    multi?: boolean;
}
export interface RemoveOptions {
    /**
     * The write concern, can either be a number from 0 to the number of nodes within
     * the cluster, or "majority" if you would like to wait for the majority of nodes
     * within the cluster to confirm the write before returning.
     *
     * It is recommended that you set this to "majority", however in all situations
     * where you mind if data is lost, you should set it to at least 1.
     */
    w?: string | number;
    /**
     * The timeout in milliseconds before the write will be aborted by the MongoDB server
     * and an error response (if the write concern is non-zero) is returned to the client.
     */
    wtimeout?: number;
    /**
     * Whether to wait for the write to be commited to the server's journal (flushed to disk)
     * or not. By specifying 1 here, you imply w:1 - howver this can be combined with w:"majority"
     * to give excellent write reliability within a cluster, even across failures.
     */
    j?: boolean;
    /**
     * Whether to only remove the first document in the collection or not, by default this is false
     * and any document matching the conditions will be removed.
     */
    single?: boolean;
}
