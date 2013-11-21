/// <reference path="net.js" />
/// <reference path="events.js" />
/// <reference path="stream.js" />

require.modules.http = new function () {
    /// <summary>
    /// To use the HTTP server and client one must require('http').
    /// </summary>
    /// <field name="STATUS_CODES" >
    /// A collection of all the standard HTTP response status codes, and the <br />
    /// short description of each.
    /// </field>
    

    this.STATUS_CODES;
    this.createServer = function (requestListener) {
        /// <summary>
        /// The requestListener is a function which is automatically added to the 'request' event.
        /// </summary>
        /// <param name='requestListener' value='requestListener(new HTTP.ServerRequest(),new HTTP.ServerResponse())' optional='true' />
        /// <returns type='HTTP.Server' />
    	return new require.modules.http.Server();
    };
    // this.createClient = function (port, host) {}; //deprecated
    this.request = function (options, callback) {
        /// <summary>
        /// Node maintains several connections per server to make HTTP requests. 
        /// This function allows one to transparently issue requests.
        /// </summary>
        /// <param name="options">Option Object or String</param>
        /// <param name="callback"></param>
    };
    this.get = function (options, callback) {
        /// <summary>
        /// Since most requests are GET requests without bodies, Node provides this convenience method. 
        /// The only difference between this method and http.request() is that it sets the method 
        /// to GET and calls req.end() automatically.
        /// </summary>
        /// <param name="options"></param>
        /// <param name="callback"></param>
    };

    this.globalAgent = new require.modules.http.Agent();
};

require.modules.http.Server = function () {
    /// <summary>HTTP Server.</summary>
    /// <field name="maxHeadersCount">Limits maximum incoming headers count, equal to 1000 by default. </field> 
    this.listen = function (port, hostname, backlog, callback) {
        /// <summary>Begin accepting connections on the specified port and hostname.</summary>
        /// <param name='port' type='Number' />
        /// <param name='hostname' type='String' optional='true'>
        /// If the hostname is omitted, the server will accept connections directed to any IPv4 address (INADDR_ANY).
        /// </param>
        /// <param name='backlog' type='Number' optional='true'>
        /// Backlog is the maximum length of the queue of pending connections. 
        /// </param>
        /// <param name='callback' value='callback(new HTTP.ServerRequest(),new HTTP.ServerResponse())' optional='true' />
    };
    //this.listen = function (path, callback) {
    //    /// <param name='path' type='String' />
    //    /// <param name='callback' value='callback(new HTTP.ServerRequest(),new HTTP.ServerResponse())' optional='true' />
    //};
    this.close = function (cb) {
        /// <summary>Stops the server from accepting new connections. </summary>
        /// <param name='cb' value='cb()' optional='true' />
    };
    this.maxHeadersCount = new Number();

};
require.modules.http.Server.prototype = new Events.EventEmitter();

require.modules.http.ServerRequest = function () {
    /// <summary>
    /// This object is created internally by a HTTP server -- not by the user -- <br />
    /// and passed as the first argument to a 'request' listener.
    /// </summary>
    /// <field name="method">
    /// The request method as a string. Read only. Example: 'GET', 'DELETE'.
    /// </field>
    /// <field name="url">
    /// The request method as a string. Read only. Example: 'GET', 'DELETE'.
    /// </field>
    /// <field name="url">
    /// Request URL string. This contains only the URL that is present in the actual HTTP request.
    /// </field>
    /// <field name="headers">
    /// Read only map of header names and values. Header names are lower-cased.
    /// </field>
    /// <field name="trailers">
    /// Read only; HTTP trailers (if present). Only populated after the 'end' event.
    /// </field>
    /// <field name="httpVersion">
    /// The HTTP protocol version as a string. Read only. Examples: '1.1', '1.0'. Also request.<br />
    /// httpVersionMajor is the first integer and request.httpVersionMinor is the second.
    /// </field>
    /// <field name="connection" type="Net.Socket">
    /// With HTTPS support, use request.connection.verifyPeer() and 
    /// request.connection.getPeerCertificate() to obtain the client's authentication details.
    /// </field>

    //Event: 'data'
    //Event: 'end'
    //Event: 'close'
    this.method = new String();
    this.url = new String();
    this.headers = new Object();
    this.trailers = new Object();
    this.httpVersion = new Number();
    this.httpVersionMajor = new Number();
    this.httpVersionMinor = new Number();
    this.setEncoding = function (encoding) {
        /// <summary>Set the encoding for the request body. See stream.setEncoding() for more information.</summary>
        /// <param name='encoding' type='String' optional='true' />
    };
    this.pause = function() {
        /// <summary>Pauses request from emitting events. Useful to throttle back an upload.</summary>
    };
    this.resume = function() {
        /// <summary>
        /// Resumes a paused request.
        /// </summary>
    };
    this.connection = new Net.Socket();
};
require.modules.http.ServerRequest.prototype = new Stream();

require.modules.http.ServerResponse = function () {
    /// <summary>
    /// This object is created internally by a HTTP server--not by the user. 
    /// It is passed as the second parameter to the 'request' event.
    /// </summary>
    /// <field name="statusCode" type="Number">
    /// When using implicit headers (not calling response.writeHead() explicitly), 
    /// this property controls the status code that will be sent to the client when the headers get flushed.
    /// </field>
    /// <field name="sendDate" type="Boolean">
    /// When true, the Date header will be automatically generated and sent 
    /// in the response if it is not already present in the headers. Defaults to true.
    /// </field>


    //Event: 'close'
    this.writeContinue = function() {
        /// <summary>
        /// Sends a HTTP/1.1 100 Continue message to the client, 
        /// indicating that the request body should be sent. 
        /// See the 'checkContinue' event on Server.
        /// </summary>
    };
    this.writeHead = function(statusCode, reasonPhrase, headers) {
        /// <summary>
        /// Sends a response header to the request. 
        /// The status code is a 3-digit HTTP status code, like 404. The last argument, headers, 
        /// are the response headers. Optionally one can give a human-readable reasonPhrase as 
        /// the second argument.
        /// </summary>
        /// <param name="statusCode"></param>
        /// <param name="reasonPhrase"></param>
        /// <param name="headers"></param>
    };
    this.statusCode = new Number();
    this.setHeader = function (name, value) {
        /// <summary>
        /// Sets a single header value for implicit headers. 
        /// If this header already exists in the to-be-sent headers, its value will be replaced. 
        /// Use an array of strings here if you need to send multiple headers with the same name.
        /// </summary>
        /// <param name="name"></param>
        /// <param name="value"></param>
    };
    this.sendDate = new Boolean();
    this.getHeader = function (name) {
        /// <summary>
        /// Reads out a header that's already been queued but not sent to the client. 
        /// Note that the name is case insensitive. This can only be called before headers get implicitly flushed.
        /// </summary>
        /// <param name="name"></param>
        /// <returns type=""></returns>
        return new String();
    };
    this.removeHeader = function (name) {
        /// <summary>Removes a header that's queued for implicit sending.</summary>
        /// <param name='name' type='String' />
    };
    this.write = function (chunk, encoding) {
        /// <summary>
        /// If this method is called and response.writeHead() has not been called, 
        /// it will switch to implicit header mode and flush the implicit headers.
        /// </summary>
        /// <param name='chunk' type='String' />
        /// <param name='encoding' type='String' optional='true' />
    };
    this.addTrailers = function (headers) {
        /// <summary>
        /// This method adds HTTP trailing headers (a header but at the end of the message) to the response.
        /// </summary>
        /// <param name='headers' type='Object' />
    };
    this.end = function (data, encoding) {
        /// <summary>
        /// Node maintains several connections per server to make HTTP requests. 
        /// This function allows one to transparently issue requests.
        /// </summary>
        /// <param name='data' type='Object' optional='true' />
        /// <param name='encoding' type='String' optional='true' />
    };
};
require.modules.http.ServerResponse.prototype = new Stream();

require.modules.http.Agent = function () {
    /// <summary>
    /// Previously, a single agent instance helped pool for a single host+port. 
    /// The current implementation now holds sockets for any number of hosts.<br />
    /// The current HTTP Agent also defaults client requests to using Connection:keep-alive. 
    /// If no pending HTTP requests are waiting on a socket to become free the socket is closed. This means that node's pool has the benefit of keep-alive when under load but still does not require developers to manually close the HTTP clients using keep-alive.
    /// </summary>
    /// <field name="maxSockets">
    /// By default set to 5. Determines how many concurrent sockets the agent can have open per host.
    /// </field>
    /// <field name="sockets">
    /// An object which contains arrays of sockets currently in use by the Agent. Do not modify.
    /// </field>
    /// <field name="request">
    /// An object which contains queues of requests that have not yet been assigned to sockets. Do not modify.
    /// </field>

    this.maxSockets = new Number();
    this.sockets = new Array();
    this.requests = new Object();
};

require.modules.http.ClientRequest = function () {
    /// <summary>
    /// This object is created internally and returned from http.request(). 
    /// It represents an in-progress request whose header has already been queued. 
    /// The header is still mutable using the setHeader(name, value), 
    /// getHeader(name), removeHeader(name) API. 
    /// The actual header will be sent along with the first data chunk or when closing the connection.
    /// </summary>

    //Event 'response'
    //Event: 'socket'
    //Event: 'connect'
    //Event: 'upgrade'
    //Event: 'continue'
    this.write = function (chunk, encoding) {
        /// <summary>
        /// Sends a chunk of the body. 
        /// By calling this method many times, the user can stream a request body 
        /// to a server--in that case it is suggested to use 
        /// the ['Transfer-Encoding', 'chunked'] header line when creating the request.
        /// </summary>
        /// <param name='chunk' type='Object' />
        /// <param name='encoding' type='String' optional='true' />
    };
    this.end = function (data, encoding) {
        /// <summary>
        /// Finishes sending the request. 
        /// If any parts of the body are unsent, 
        /// it will flush them to the stream. If the request is chunked, 
        /// this will send the terminating '0\r\n\r\n'.
        /// </summary>
        /// <param name='data' type='Object' />
        /// <param name='encoding' type='String' optional='true' />
    };
    this.abort = function() {
        /// <summary>
        /// Aborts a request. (New since v0.3.8.)
        /// </summary>
    };
    this.setTimeout = function (timeout, callback) {
        /// <summary>
        /// Once a socket is assigned to this request and is connected socket.setTimeout() will be called.
        /// </summary>
        /// <param name='timeout' type='Number' />
        /// <param name='callback' value='callback()' optional='true' />
    };
    this.setNoDelay = function (noDelay) {
        /// <summary>
        /// Once a socket is assigned to this request and is connected socket.setNoDelay() will be called.
        /// </summary>
        /// <param name='noDelay' type='Boolean' optional='true' />
    };
    this.setSocketKeepAlive = function (enable, initialDelay) {
        /// <summary>
        /// Once a socket is assigned to this request and is connected socket.setKeepAlive() will be called.
        /// </summary>
        /// <param name="enable"></param>
        /// <param name="initialDelay"></param>
    };
};
require.modules.http.ClientRequest.prototype = new Stream();

require.modules.http.ClientResponse = function () {
    /// <summary>
    /// This object is created when making a request with http.request().
    ///  It is passed to the 'response' event of the request object.
    /// </summary>
    /// <field name="statusCode">
    /// The 3-digit HTTP response status code. E.G. 404.
    /// </field>
    /// <field name="httpVersion">
    /// The HTTP version of the connected-to server. 
    /// Probably either '1.1' or '1.0'. Also response.httpVersionMajor is 
    /// the first integer and response.httpVersionMinor is the second.
    /// </field>
    /// <field name="headers">
    /// The response headers object.
    /// </field>
    /// <field name="trailers">
    /// The response trailers object. Only populated after the 'end' event.
    /// </field>

    //Event: 'data'
    //Event: 'end'
    //Event: 'close'
    this.statusCode = new Number();
    this.httpVersion = new Number();
    this.headers = new Object();
    this.trailers = new Object();
    this.setEncoding = function (encoding) {
        /// <summary>Set the encoding for the response body.</summary>
        /// <param name='encoding' type='String' optional='true' />
    };
    
    this.pause = function() {
        /// <summary>
        /// Pauses response from emitting events. Useful to throttle back a download.
        /// </summary>
    };
    this.resume = function() {
        /// <summary>
        /// Resumes a paused response.
        /// </summary>
    };
};
require.modules.http.ClientResponse.prototype = new Stream();
