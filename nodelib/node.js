/// node.js 0.8.18

/// <reference path="core.js" />
/// <reference path="buffer.js"/>
/// <reference path="process.js"/>
/// <reference path="console.js"/>
/// <reference path="module.js"/>
/// <reference path="events.js"/>
/// <reference path="domain.js"/>
/// <reference path="tls.js"/>
/// <reference path="fs.js"/>
/// <reference path="net.js"/>
/// <reference path="path.js"/>
/// <reference path="stream.js"/>
/// <reference path="stringdecoder.js"/>
/// <reference path="util.js"/>
/// <reference path="crypto.js"/>
/// <reference path="dgram.js"/>
/// <reference path="dns.js"/>
/// <reference path="http.js"/>
/// <reference path="https.js"/>
/// <reference path="url.js"/>
/// <reference path="querystring.js"/>
/// <reference path="readline.js"/>
/// <reference path="repl.js"/>
/// <reference path="vm.js"/>
/// <reference path="child_process.js"/>
/// <reference path="assert.js"/>
/// <reference path="tty.js"/>
/// <reference path="zlib.js"/>
/// <reference path="os.js"/>
/// <reference path="cluster.js"/>
/// <reference path="punycode.js" />
/// <reference path="stringdecoder.js" />

var global = new Object();
var process = new Process();
var console = new Console();
var module = new Module();
var exports = module.exports;

// Allows req to autocomplete to require().
delete requestAnimationFrame;

var __filename = new String();
var __dirname = new String();
var setTimeout = function (cb, ms) {
    /// <summary>
    /// To schedule execution of a one-time callback after delay milliseconds. <br />
    /// Returns a timeoutId for possible use with clearTimeout(). Optionally <br />
    /// you can also pass arguments to the callback.
    /// </summary>
    /// <param name='cb'>
    /// Callback function.
    /// </param>
    /// <param name='ms'>
    /// Dlay Time(ms)
    /// </param>
    /// <returns>timeoutId</returns>

    return new Number();
};
var clearTimeout = function (t) {
    /// <summary>
    /// Prevents a timeout from triggering.
    /// </summary>
    /// <param name='t'>
    /// timeoutId
    /// </param>
};
var setInterval = function (cb, ms) {
    /// <summary>
    /// To schedule the repeated execution of callback every delay milliseconds.<br />
    /// Returns a intervalId for possible use with clearInterval(). Optionally <br />
    /// you can also pass arguments to the callback.
    /// </summary> 
    /// <param name='cb'>
    /// Callback function.
    /// </param>
    /// <param name='ms'>
    /// Dlay Time(ms)
    /// </param>
    /// <returns>timeoutId</returns>

    return new Number();
};
var clearInterval = function (t) {
    /// <summary>
    /// Prevents a timeout from triggering.
    /// </summary>
    /// <param name='t'>
    /// timeoutId
    /// </param>
};
