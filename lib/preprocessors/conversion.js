var preprocessor = require('./preprocessor');
var _ = require('lodash');

(require.modules || {}).conversion = module.exports = Conversion;

function Conversion(functions) {
	/// <summary>Creates a new rename preprocessor with the given mappings</summary>
	/// <param name="functions" type="Object">Mapping of conversion functions to their respective properties</param>

	if(!(this instanceof Conversion)) return new Conversion(functions);

	preprocessor.call(this);

	Object.defineProperty(this, 'functions', {
		get: function() { return functions; },
		enumerable: false
	});
}

Conversion.prototype.__proto__ = preprocessor.prototype;

Conversion.prototype.toSource = function(object) {
	/// <summary>Transforms the given object into the source format</summary>
	/// <param name="object" type="Object">The object to transform</summary>

	transform(this.functions, '$up', object);
};

Conversion.prototype.toLocal = Conversion.prototype.fromSource = function(object) {
	/// <summary>Transforms the given object into the destination format</summary>
	/// <param name="object" type="Object">The object to transform</summary>
	
	transform(this.functions, '$down', object);
};

function transform(transforms, method, properties) {
	/// <summary>Transforms properties according to a number of transformation functions</summary>
	/// <param name="transforms" type="Object">Mapped transformation functions to apply</param>
	/// <param name="method" type="String">The transformation method to apply to the properties</param>
	/// <param name="properties" type="Object">The object on which to apply the transformations</param>

	if (!_.isPlainObject(properties)) return; // Cannot transform strange objects

	for (var k in transforms) {
		if(k[0] === '$') break; // Transform methods, not properties to transform

		if (transforms[k] && transforms[k][method]) {
			// Have a direct transform to apply
			var newValue = transforms[k][method](properties[k]);
			if(newValue === undefined) delete properties[k];
			else properties[k] = newValue;
		} else if (transforms[k]) {
			// Have a nested transformation to apply
			transform(transforms[k], method, properties[k]);
		}
	}
}