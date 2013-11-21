require.modules.path = new function () {
    /// <summary>
    /// This module contains utilities for handling and transforming file <br />
    /// paths. Almost all these methods perform only string transformations. <br />
    /// The file system is not consulted to check whether paths are valid.
    /// </summary>
    /// <field  name='sep' type='String'>
    /// The platform-specific file separator. '\\' or '/'.
    /// </field >
    
    this.normalize = function (p) {
        /// <summary>
        /// Normalize a string path, taking care of '..' and '.' parts.<br />
        /// When multiple slashes are found, they're replaced by a single one; <br />
        /// when the path contains a trailing slash, it is preserved. On <br />
        /// windows backslashes are used.
        /// </summary>
        /// <param name='p' type='String' />
        /// <returns type='String' />
        return new String();
    };
    this.join = function (path1, path2, pathX) {
        /// <summary>
        /// Join all arguments together and normalize the resulting path. <br />
        /// Non-string arguments are ignored.
        /// </summary>
        /// <param name='path1' type='String' optional='true' />
        /// <param name='path2' type='String' optional='true' />
        /// <param name='pathX' type='String' optional='true' />
        /// <returns type='String' />
        return new String();
    };
    this.resolve = function (from, to) {
        /// <summary>
        /// Resolves to to an absolute path.
        /// </summary>
        /// <param name='from' type='String' optional='true' />
        /// <param name='to' type='String' />
        /// <returns type='String' />
        return new String();
    };
    this.relative = function (from, to) {
        /// <summary>
        /// Solve the relative path from from to to.
        /// </summary>
        /// <param name='from' type='String'/>
        /// <param name='to' type='String' />
        /// <returns type='String' />
        return new String();
    };
    this.dirname = function (p) {
        /// <summary>
        /// Return the directory name of a path. Similar to the Unix dirname command.
        /// </summary>
        /// <param name='p' type='String' />
        /// <returns type='String' />
        return new String();
    };
    this.basename = function (p, ext) {
        /// <summary>
        /// Return the last portion of a path. Similar to the Unix basename command.
        /// </summary>
        /// <param name='p' type='String' />
        /// <param name='ext' type='String' optional='true' />
        /// <returns type='String' />
        return new String();
    };
    this.extname = function (p) {
        /// <summary>
        /// Return the extension of the path, from the last '.' to end of <br />
        /// string in the last portion of the path. If there is no '.' in the <br />
        /// last portion of the path or the first character of it is '.', then <br />
        /// it returns an empty string.
        /// </summary>
        /// <param name='p' type='String' />
        /// <returns type='String' />
        return new String();
    };

	/// <summary>
	/// The platform-specific file separator. '\\' or '/'.
	/// </summary>
	/// <returns type='String' />
    this.sep = new String();

    this.basename = function (p, ext) {
        /// <summary>
        /// Return the last portion of a path. Similar to the Unix basename command.
        /// </summary>
        /// <param name='p' type='String' />
        /// <param name='ext' type='String' optional='true' />
        /// <returns type='String' />
        return new String();
    };

	/// <summary>
	/// The platform-specific path delimiter, ; or ':'.
	/// </summary>
	/// <returns type='String' />
	this.delimiter = new String();
};
