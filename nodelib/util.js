/// <reference path="stream.js"/>

require.modules.util = new function () {
    /// <summary>These functions are in the module 'util'. Use require('util') to access them.</summary>
    this.format = function (format, args) {
        /// <summary>Returns a formatted string using the first argument as a printf-like format.</summary>
        /// <param name='format' type='String'>
        /// %s String, %d Number, %j JSON
        /// </param>
        /// <param name='args' type='Object' optional='true' />
        /// <returns type='String' />
        return new String();
    };
    this.debug = function (string) {
        /// <summary>
        /// A synchronous output function. 
        /// Will block the process and output string immediately to stderr.
        /// </summary>
        /// <param name='string' type='String' />
    };
    this.error = function (args) {
        /// <summary>
        /// Same as util.debug() except this will output all arguments immediately to stderr.
        /// </summary>
        /// <param name='args' type='Object' optional='true' />
    };
    this.puts = function (args) {
        /// <summary>
        /// A synchronous output function. 
        /// Will block the process and output all arguments to stdout with newlines after each argument.
        /// </summary>
        /// <param name='args' type='Object' optional='true' />
    };
    this.print = function (args) {
        /// <summary>
        /// A synchronous output function. 
        /// Will block the process, cast each argument to a string then output to stdout. 
        /// Does not place newlines after each argument.
        /// </summary>
        /// <param name='args' type='Object' optional='true' />
    };
    this.log = function (string) {
        /// <summary>Output with timestamp on stdout.</summary>
        /// <param name='string' type='String' />
    };
    this.inspect = function (object, showHidden, depth, colors) {
        /// <summary>
        /// Return a string representation of object, which is useful for debugging.
        /// </summary>
        /// <param name='object' type='Object' />
        /// <param name='showHidden' type='Boolean' optional='true'  />
        /// <param name='depth' type='Number' optional='true'  />
        /// <param name='colors' type='Boolean' optional='true'  />
        /// <returns type='String' />
        return new String();
    };
    this.isArray = function (object) {
        /// <summary>
        /// Returns true if the given "object" is an Array. false otherwise.
        /// </summary>
        /// <param name='object' type='Object' />
        /// <returns type='Boolean' />
        return new Boolean();
    };
    this.isRegExp = function (object) {
        /// <summary>
        /// Returns true if the given "object" is a RegExp. false otherwise.
        /// </summary>
        /// <param name='object' type='Object' />
        /// <returns type='Boolean' />
        return new Boolean();
    };
    this.isDate = function (object) {
        /// <summary>
        /// Returns true if the given "object" is a Date. false otherwise.
        /// </summary>
        /// <param name='object' type='Object' />
        /// <returns type='Boolean' />
        return new Boolean();
    };
    this.isError = function (object) {
        /// <summary>
        /// Returns true if the given "object" is an Error. false otherwise.
        /// </summary>
        /// <param name='object' type='Object' />
        /// <returns type='Boolean' />
        return new Boolean();
    };
    this.pump = function (readableStream, writableStream, callback) {
        /// <summary>
        /// Read the data from readableStream and send it to the writableStream. 
        /// When writableStream.write(data) returns false readableStream 
        /// will be paused until the drain event occurs on the writableStream. 
        /// callback gets an error as its only argument and is called 
        /// when writableStream is closed or when an error occurs.
        /// </summary>
        /// <param name='readableStream' type='Stream' />
        /// <param name='writableStream' type='Stream' />
        /// <param name='callback' value='callback(new Error())' optional='true' />
    };
    this.inherits = function (constructor, superConstructor) {
        /// <summary>
        /// Inherit the prototype methods from one constructor into another. 
        /// The prototype of constructor will be set to a new object created from superConstructor.
        /// </summary>
        /// <param name='constructor' type='Object' />
        /// <param name='superConstructor' type='Object' />
    };
};

