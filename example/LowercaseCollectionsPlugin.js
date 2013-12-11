var Database = require('iridium');

var Plugin = {
	newModel: function(db, db, collection, schema, options) {
		this.collection = collection.toLowerCase();
	}
};

module.exports = Plugin;