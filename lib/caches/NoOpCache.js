module.exports = NoOpCache;

function NoOpCache(options) {
	/// <summary>Creates a new cache which performs no caching of instances</summary>
	/// <param name="options" type="Object">Options dictating the configuration of this cache</param>
}

NoOpCache.prototype.valid = function(conditions) {
	/// <summary>Determines whether or not an object with the given conditions can be retrieved from this cache</summary>
	/// <param name="conditions" type="Object">The conditions for which the document was retrieved</param>
	/// <return type="Boolean"/>
};

NoOpCache.prototype.store = function(conditions, document, callback) {
	/// <summary>Stores a document in the cache for future access</summary>
	/// <param name="conditions" type="Object">The conditions that resulted in this object being stored, null for insertions</param>
	/// <param name="document" type="Object">The database object to store in the cache</param>
	/// <param name="callback" type="Function">A function which is called once the document has been stored</param>

	return callback();
};

NoOpCache.prototype.fetch = function(conditions, callback) {
	/// <summary>Fetches the document with the matching id from the cache</summary>
	/// <param name="conditions" type="Object">The conditions used to select the object to be returned from the cache</param>
	/// <param name="callback" type="Function">A function to call with the retrieved value</param>

	return callback(null);
};

NoOpCache.prototype.drop = function(conditions, callback) {
	/// <summary>Removes the document with the matching id from the cache</summary>
	/// <param name="conditions" type="Object">The conditions used to select the object to be removed from the cache</param>
	/// <param name="callback" type="Function">A function to call once the document has been removed from the cache</param>

	return callback(null);
};