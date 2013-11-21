var _ = require('lodash');


(require.modules || {}).transforms = module.exports = transform;

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
			if(newValue === undefined && properties[k] !== undefined) delete properties[k];
			else if(newValue !== undefined) properties[k] = newValue;
		} else if (transforms[k]) {
			// Have a nested transformation to apply
			transform(transforms[k], method, properties[k]);
		}
	}
}

transform.up = function (transforms, properties) {
	/// <summary>Transforms properties according to a number of transformation functions</summary>
	/// <param name="transforms" type="Object">Mapped transformation functions to apply</param>
	/// <param name="properties" type="Object">The object on which to apply the transformations</param>

	transform(transforms, '$up', properties);
};

transform.down = function (transforms, properties) {
	/// <summary>Transforms properties according to a number of transformation functions</summary>
	/// <param name="transforms" type="Object">Mapped transformation functions to apply</param>
	/// <param name="properties" type="Object">The object on which to apply the transformations</param>

	transform(transforms, '$down', properties);
};