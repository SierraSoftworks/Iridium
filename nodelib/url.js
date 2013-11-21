/// <reference path="node.js" />

require.modules.url = new function () {
    /// <summary>
    /// This module has utilities for URL resolution and parsing. Call require('url') to use it.
    /// </summary<>
    this.parse = function (urlStr, parseQueryString, slashesDenoteHost) {
        /// <summary>Take a URL string, and return an object.</summary>
        /// <param name='urlStr' type='String' />
        /// <param name='parseQueryString' type='Boolean' optional='true'></param>
        /// <param name='slashesDenoteHost' type='Boolean' optional='true'></param>
        /// <returns type='Object'>URL Object.</returns>
        return new Object();
    };
    this.format = function(urlObj) {
    	/// <summary>
        /// Take a parsed URL object, and return a formatted URL string.
    	/// </summary>
        /// <param name="urlObj">URL Object</param>
        /// <returns type="String" />
        return new String();
    };
    this.resolve = function(from, to) {
    	/// <summary>
        /// Take a base URL, and a href URL, and resolve them as a browser would for an anchor tag.
    	/// </summary>
    	/// <param name="from"></param>
        /// <param name="to"></param>
        /// <returns type="String" />
        return new String();
    };
};
