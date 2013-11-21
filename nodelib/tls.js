/// <reference path="net.js"/>
/// <reference path="stream.js"/>
/// <reference path="events.js" />

require.modules.tls = new function () {
    /// <summary>
    /// The tls module uses OpenSSL to provide Transport Layer Security and/or <br />
    /// Secure Socket Layer: encrypted stream communication.<br />
    /// </summary>
    
    var SecurePair = function() {
    	/// <summary>
        /// Returned by tls.createSecurePair.
    	/// </summary>
    };
    this.createServer = function (options, secureConnectionListener) {
        /// <summary>
        /// Creates a new tls.Server. The connectionListener argument is <br />
        /// automatically set as a listener for the secureConnection event.
        /// </summary>
        /// <param name='options' type='Object' />
        /// <param name='secureConnectionListener' value='secureConnectionListener(new TLS.CleartextStream())' optional='true' />
        /// <returns type='TLS.Server' />
    	return new require.modules.tls.Server();
    };
    this.Connect = function (options, callback) {
    	/// <summary>
        ///  Creates a new client connection to the given port and host (old API) or options.port and options.host. 
    	/// </summary>
    	/// <param name="options">option object.</param>
        /// <param name="callback" optional='true'></param>
        /// <returns type="TLS.CleartextStream()" />
    	return new require.modules.tls.CleartextStream();
    };
    this.connect = function (port, host, options, secureConnectionListener) {
        /// <summary>
        /// Creates a new client connection to the given port and host (old API) or options.port and options.host. 
        /// </summary>
        /// <param name='port' type='Number' />
        /// <param name='host' type='String' optional='true' />
        /// <param name='options' type='Object' optional='true' />
        /// <param name='secureConnectionListener' value='secureConnectionListener(new TLS.CleartextStream())' optional='true' />
        /// <returns type='TLS.CleartextStream' />
    	return new require.modules.tls.CleartextStream();
    };
    this.createSecurePair = function (credentials, isServer, requestCert, rejectUnauthorized) {
        /// <summary>
        /// Creates a new secure pair object with two streams, one of which <br />
        /// reads/writes encrypted data, and one reads/writes cleartext data. <br />
        /// Generally the encrypted one is piped to/from an incoming encrypted <br />
        /// data stream, and the cleartext one is used as a replacement for the <br />
        /// initial encrypted stream.
        /// </summary>
        /// <param name='credentials' type='Object' optional='true' />
        /// <param name='isServer' type='Boolean' optional='true' />
        /// <param name='requestCert' type='Boolean' optional='true' />
        /// <param name='rejectUnauthorized' type='Boolean' optional='true' />
        /// <returns type='SecurePair' />
        return new SecurePair();
    };
};


require.modules.tls.Server = function () {
    /// <summary>
    /// This class is a subclass of net.Server and has the same methods on it. <br />
    /// Instead of accepting just raw TCP connections, this accepts encrypted <br />
    /// connections using TLS or SSL.
    /// </summary>
    /// <field name="maxConnections">
    /// Set this property to reject connections when the server's connection count gets high.
    /// </field>
    /// <field name="connections">
    /// Set this property to reject connections when the server's connection count gets high.
    /// </field>
    this.listen = function (port, host, callback) {
        /// <summary>
        /// Begin accepting connections on the specified port and host. If the <br />
        /// host is omitted, the server will accept connections directed to any <br />
        /// IPv4 address (INADDR_ANY).
        /// </summary>
        /// <param name='port' type='Number' />
        /// <param name='host' type='String' optional='true' />
        /// <param name='callback' value='callback()' optional='true' />
    };
    this.close = function() {
    	/// <summary>
        /// Stops the server from accepting new connections. This function is <br />
        /// asynchronous, the server is finally closed when the server emits a <br />
    	/// 'close' event.
    	/// </summary>
    };
    this.address = function () {
        /// <summary>
        /// Returns the bound address, the address family name and port of the <br />
        /// server as reported by the operating system. See net.Server.address() <br />
        /// for more information.
        /// </summary>
        /// <returns type='Object' />
        return { port: 0, family: '', address: '' };
    };
    this.addContext = function (hostname, credentials) {
        /// <summary>
        /// Add secure context that will be used if client request's SNI <br />
        /// hostname is matching passed hostname (wildcards can be used). <br />
        /// credentials can contain key, cert and ca.
        /// </summary>
        /// <param name='hostname' type='String' />
        /// <param name='credentials' type='Object' />
    };
    this.maxConnections = new Number();
    this.connections = new Number();
    


};

require.modules.tls.Server.prototype = new Net.Server();

require.modules.tls.CleartextStream = function () {
    /// <summary>
    /// This is a stream on top of the Encrypted stream that makes it possible <br />
    /// to read/write an encrypted data as a cleartext data.
    /// </summary>
    /// <field name="authorized">
    /// A boolean that is true if the peer certificate was signed by one of the specified CAs, otherwise false.
    /// </field>
    /// <field name="authorizationError">
    /// The reason why the peer's certificate has not been verified. This property becomes available only when cleartextStream.authorized === false.
    /// </field>
    /// <field name="remoteAddress">
    /// The string representation of the remote IP address. For example, '74.125.127.100' or '2001:4860:a005::68'.
    /// </field>
    /// </field>
    /// <field name="remotePort">
    /// The numeric representation of the remote port. For example, 443.
    /// </field>
    

    this.authorized = new Boolean();
    this.authorizationError = new String();
    this.getPeerCertificate = function () {
        /// <summary>
        /// Returns an object representing the peer's certificate. The returned <br />
        /// object has some properties corresponding to the field of the certificate.
        /// </summary>
        /// <returns type='Object' />
        return new Object();
    };
    this.getCipher = function () {
        /// <summary>
        /// Returns an object representing the cipher name and the SSL/TLS <br />
        /// protocol version of the current connection.
        /// </summary>
        /// <returns type='Object' />
        return { name: '', version: '' };
    };
    this.address = function () {
        /// <summary>
        /// Returns the bound address, the address family name and port of the <br />
        /// underlying socket as reported by the operating system. Returns an <br />
        /// object with three properties, e.g. { port: 12346, family: 'IPv4', <br />
        /// address: '127.0.0.1' }
        /// </summary>
        /// <returns type='Object' />
        return { port: 0, family: '', address: '' };
    };
    this.remoteAddress = new String();
    this.remotePort = new Number();
};

require.modules.tls.CleartextStream.prototype = new Stream();
