/// <param name='hostname' type='String' optional='true' />
/// <param name='callback' value='callback(new HTTP.ClientRequest())' />
/// <returns type='HTTP.ClientRequest' />

var Console = function () {
    /// <summary>
    /// For printing to stdout and stderr. <br />
    /// Similar to the console object functions provided by most web browsers, here the output is sent to stdout or stderr.
    /// </summary>
    this.log = function (data) {
        /// <summary>
        /// Prints to stdout with newline. This function can take multiple arguments in a printf()-like way.<br />
        /// Example: console.log('count: %d', count);<br />
        /// </summary>    
        /// <param name='data' type='String' optional='true' />
    };
    this.info = function (data) {
        /// <summary>
        /// Prints to stdout with newline. This function can take multiple arguments in a printf()-like way.<br />
        /// Example: console.log('count: %d', count);<br />
        /// </summary>    
        /// <param name='data' type='String' optional='true' />
    };
    this.error = function (data) {
        /// <summary>
        /// Prints to stderr with newline. This function can take multiple arguments in a printf()-like way.<br />
        /// Example: console.log('count: %d', count);<br />
        /// </summary>    
        /// <param name='data' type='String' optional='true' />
    };
    this.warn = function (data) {
        /// <summary>
        /// Prints to stderr with newline. This function can take multiple arguments in a printf()-like way.<br />
        /// Example: console.log('count: %d', count);<br />
        /// </summary>    
        /// <param name='data' type='String' optional='true' />
    };
    this.dir = function (obj) {
        /// <summary>
        /// Uses util.inspect on obj and prints resulting string to stdout.
        /// </summary>    
        /// <param name='obj' type='Object'/>
    };
    this.time = function (label) {
        /// <summary>
        /// Mark a time.
        /// </summary>    
        /// <param name='label' type='String' />
    };
    this.timeEnd = function (label) {
        /// <summary>
        /// Finish timer, record output.
        /// </summary>    
        /// <param name='label' type='String' />
    };
    this.trace = function (label) {
        /// <summary>
        /// Print a stack trace to stderr of the current position.
        /// </summary>    
        /// <param name='label' type='String' />
    };
    this.assert = function (expression, message) {
        /// <summary>
        /// Same as assert.ok() where if the expression evaluates as false throw an AssertionError with message.
        /// </summary>    
        /// <param name='expression' type='Object'>truthy</param>
        /// <param name='message' type='String' optional='true' />
    };
};
