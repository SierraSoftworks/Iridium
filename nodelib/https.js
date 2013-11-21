/// <reference path="tls.js" />
/// <reference path="http.js" />

require.modules.https = new function () {
    /// <summary>HTTPS is the HTTP protocol over TLS/SSL. In Node this is implemented as a separate module.</summary>
    this.createServer = function (options, requestListener) {
        /// <summary>
        /// Returns a new HTTPS web server object. 
        /// The options is similar to tls.createServer(). 
        /// The requestListener is a function which is automatically added to the 'request' event.
        /// </summary>
        /// <param name='options' type='Object' />
        /// <param name='requestListener' value='requestListener(new HTTP.ServerRequest(),new HTTP.ServerResponse())' optional='true' />
        /// <returns type='HTTPS.Server' />
    	return new require.modules.https.Server();
    };
    this.request = function (options, callback) {
        /// <summary>
        /// Makes a request to a secure web server.
        /// </summary>
        /// <param name='options' type='Object' />
        /// <param name='callback' value='callback(new HTTP.ClientRequest())' optional='true'/>
        /// <returns type='HTTP.ClientRequest' />
    	return new require.modules.http.ClientRequest();
    };
    this.get = function (options, callback) {
        /// <summary>Like http.get() but for HTTPS.</summary>
        /// <param name='options' type='Object' />
        /// <param name='callback' value='callback(new HTTP.ClientRequest())' optional='true'/>
        /// <returns type='HTTP.ClientRequest' />
    	return new require.modules.http.ClientRequest();
    };
    this.globalAgent = new require.modules.https.Agent();
};

require.modules.https.Server = function() {
    /// <summary>This class is a subclass of tls.Server and emits events same as http.Server.</summary>
};
require.modules.https.Server.prototype = new TLS.Server();

require.modules.https.Agent = function() {
	/// <summary>
    /// An Agent object for HTTPS similar to http.Agent. See https.request() for more information.
	/// </summary>

};

require.modules.https.Agent.prototype = new require.modules.http.Agent();

