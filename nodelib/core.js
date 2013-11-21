/// node.js 0.8.18

function require(name) {
	/// <summary>Loads the specified module or file for use</summary>
	/// <param name="name" type="String">The name of the module, or relative path to the file to load</param>

	return require.modules[name.substr(name.lastIndexOf('/') + 1)];
};

// Contains modules recognized by require()
// Add a property to this object to support
// other modules.
require.modules = {};

require.resolve = new Function();
require.cache = new Object();
require.extensions = new Array();