module.exports = NoOpCache;

function NoOpCache(options) {
	/// <summary>Creates a new cache which performs no caching of instances</summary>
	/// <param name="options" type="Object">Options dictating the configuration of this cache</param>
}

NoOpCache.prototype.store = function(document, callback) {
	/// <summary>Stores a document in the cache for future access</summary>
	/// <param name="document" type="Object">The database object to store in the cache</param>
	/// <param name="callback" type="Function">A function which is called once the document has been stored</param>

	return callback();
};

NoOpCache.prototype.fetch = function(id, callback) {
	/// <summary>Fetches the document with the matching id from the cache</summary>
	/// <param name="id" type="Mixed">The _id field of the document to retrieve from the cache</param>
	/// <param name="callback" type="Function">A function to call with the retrieved value</param>

	return callback(null);
};

NoOpCache.prototype.drop = function(id, callback) {
	/// <summary>Removes the document with the matching id from the cache</summary>
	/// <param name="id" type="Mixed">The _id field of the document to remove from the cache</param>
	/// <param name="callback" type="Function">A function to call once the document has been removed from the cache</param>

	return callback(null);
};