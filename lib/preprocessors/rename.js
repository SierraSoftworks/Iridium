var preprocessor = require('./preprocessor');

(require.modules || {}).rename = module.exports = Rename;

function Rename(mapping) {
	/// <summary>Creates a new rename preprocessor with the given mappings</summary>
	/// <param name="mapping" type="Object">The map of source properties to destination properties</param>

	if(!(this instanceof Rename)) return new Rename(mapping);

	preprocessor.call(this);

	Object.defineProperty(this, 'mapping', {
		get: function() { return mapping; },
		enumerable: false
	});
}

Rename.prototype.__proto__ = preprocessor.prototype;

Rename.prototype.toSource = function(object) {
	/// <summary>Transforms the given object into the source format</summary>
	/// <param name="object" type="Object">The object to transform</summary>

	for(var k in this.mapping) {
		if(!object.hasOwnProperty(this.mapping[k])) continue;
		object[k] = object[this.mapping[k]];
		delete object[this.mapping[k]];
	}
};

Rename.prototype.toLocal = Rename.prototype.fromSource = function(object) {
	/// <summary>Transforms the given object into the destination format</summary>
	/// <param name="object" type="Object">The object to transform</summary>

	for(var k in this.mapping) {
		if(!object.hasOwnProperty(k)) continue;
		object[this.mapping[k]] = object[k];
		delete object[k];
	}
};