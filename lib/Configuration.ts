import MongoDB = require("mongodb");

export interface Configuration {
    host?: string;
    port?: number;
    hosts?: { address: string; port?: number }[];
    database?: string;
    username?: string;
    password?: string;

    options?: ConnectionOptions;

    [key:string]: any;
}

interface ConnectionOptions {
    db?: DatabaseLevelConnectionOptions;
    server?: ServerLevelConnectionOptions;
    replset?: ReplicasetLevelConnectionOptions;
    mongos?: MongosLevelConnectionOptions;
}

interface DatabaseLevelConnectionOptions {
    /**
     * The write concern for the operation where < 1 is no acknowledgment of write and w >= 1 or w = ‘majority’ acknowledges the write
     */
    w?: string | number;

    /**
     * Set the timeout for waiting for write concern to finish (combines with w option)
     */
    wtimeout?: number;

    /**
     * Write waits for fsync before returning
     */
    fsync?: boolean;

    /**
     * Write waits for journal sync before returning
     */
    j?: boolean;

    /**
     * The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
     */
    readPreference?: string;

    /**
     * The tags object {‘loc’:‘ny’} used with the readPreference.
     */
    readPreferenceTags?: any;

    /**
     * Use c++ bson parser.
     */
    native_parser?: boolean;

    /**
     * Force server to create _id fields instead of client.
     */
    forceServerObjectId?: boolean;

    /**
     * Object overriding the basic ObjectID primary key generation.
     */
    pkFactory?: any;

    /**
     * Serialize functions.
     */
    serializeFunctions?: boolean;

    /**
     * Perform operations using raw bson buffers.
     */
    raw?: boolean;

    /**
     * Number of milliseconds between retries.
     */
    retryMiliseconds?: number;

    /**
     * Number of retries off connection.
     */
    numberOfRetries?: number;

    /**
     * Sets a cap on how many operations the driver will buffer up before giving up on getting a working connection, default is -1 which is unlimited.
     */
    bufferMaxEntries?: number;
}

interface ServerLevelConnectionOptions extends BasicConnectionOptions {
    autoReconnect?: boolean;
}

interface ReplicasetLevelConnectionOptions extends MongosLevelConnectionOptions {
    replicaSet?: string;
    connectWithNoPrimary?: boolean;
}

interface MongosLevelConnectionOptions extends BasicConnectionOptions {
    ha?: boolean;
    haInterval?: number;
    secondaryAcceptableLatencyMS?: number;
}

interface BasicConnectionOptions {
    poolSize?: number;
    ssl?: boolean;
    sslValidate?: boolean;
    sslCA?: Buffer[] | string[];
    sslCert?: Buffer | string;
    sslKey?: Buffer | string;
    sslPass?: Buffer | string;

    socketOptions?: {
        noDelay?: boolean;
        keepAlive?: number;
        connectTimeoutMS?: number;
        socketTimeoutMS?: number;
    }
}