var Database = require('iridium');

var Plugin = {
	validate: function(schema, value, propertyName) {
		if(schema == 'Uppercase')
			return this.assert(value.toUpperCase() == value, 'uppercase string', value);
		if(schema == 'Lowercase')
			return this.assert(value.toLowerCase() == value, 'lowercase string', value);
	}
};

module.exports = Plugin;