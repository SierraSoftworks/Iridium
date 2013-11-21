/// <reference path="core.js" />

require.modules.net = new function () {
    this.createServer = function (options, connectionListener) {
        /// <summary>Creates a new TCP server.</summary>
        /// <param name='options' type='Object' optional='true' />
        /// <param name='connectionListener' value='connectionListener(new Net.Socket())' optional='true'>
        ///  The connectionListener argument is automatically set as a listener for the 'connection' event.
        /// </param>
        /// <returns type='Net.Server' />
        return new require.modules.net.Server();
    };
    this.connect = function (options, connectionListener) {
        /// <summary>Constructs a new socket object and opens the socket to the given location. When the socket is established, the 'connect' event will be emitted.</summary>
        /// <param name='options' type='Object' optional='true'>
        /// For TCP sockets, options argument should be an object which specifies:<br />
        /// port: Port the client should connect to (Required). exp. {port: 8124}<br />
        /// host: Host the client should connect to. Defaults to 'localhost'.<br />
        /// localAddress: Local interface to bind to for network connections.
        /// </param>    
        /// <param name='connectionListener' value='connectionListener(new Net.Socket())' optional='true' >
        /// The connectListener parameter will be added as an listener for the 'connect' event.
        /// </param>
        /// <returns type='Net.Socket' />
        return new require.modules.net.Socket();
    };
    this.createConnection = function (options, connectionListener) {
        /// <summary>Constructs a new socket object and opens the socket to the given location. When the socket is established, the 'connect' event will be emitted.</summary>
        /// <param name='options' type='Object' optional='true'>
        /// For TCP sockets, options argument should be an object which specifies:<br />
        /// port: Port the client should connect to (Required). exp. {port: 8124}<br />
        /// host: Host the client should connect to. Defaults to 'localhost'.<br />
        /// localAddress: Local interface to bind to for network connections.
        /// </param>    
        /// <param name='connectionListener' value='connectionListener(new Net.Socket())' optional='true' >
        /// The connectListener parameter will be added as an listener for the 'connect' event.
        /// </param>
        /// <returns type='Net.Socket' />
        return new require.modules.net.Socket();
    };
    this.isIP = function (input) {
        /// <summary>Tests if input is an IP address. Returns 0 for invalid strings, returns 4 for IP version 4 addresses, and returns 6 for IP version 6 addresses.</summary>
        /// <param name='input' type='String' />
        /// <returns type='Boolean' />
        return new Boolean();
    };
    this.isIPv4 = function (input) {
        /// <summary>Returns true if input is a version 4 IP address, otherwise returns false.</summary>
        /// <param name='input' type='String' />
        /// <returns type='Boolean' />
        return new Boolean();
    };
    this.isIPv6 = function (input) {
        /// <summary>Returns true if input is a version 6 IP address, otherwise returns false.</summary>
        /// <param name='input' type='String' />
        /// <returns type='Boolean' />
        return new Boolean();
    };
};




require.modules.net.Socket = function (options) {
    /// <summary>
    /// Construct a new socket object.
    /// </summary>
    /// <param name='options' type='String' optional='true'>
    /// 'fd' allows you to specify the existing file descriptor of socket. <br />
    /// 'type' specified underlying protocol. It can be 'tcp4', 'tcp6', or 'unix'. <br />
    /// 'allowHalfOpen' If allowHalfOpen is true, then the socket won't automatically send a FIN packet when the other end of the socket sends a FIN packet. The socket becomes non-readable, but still writable. You should call the end() method explicitly. See 'end' event for more information.
    /// </param>
    /// <field name="bufferSize">`net.Socket` has the property that `socket.write()` always works. This is to help users get up and running quickly. The computer cannot always keep up with the amount of data that is written to a socket - the network connection simply might be too slow. Node will internally queue up the data written to a socket and send it out over the wire when it is possible. (Internally it is polling on the socket's file descriptor for being writable). The consequence of this internal buffering is that memory may grow. This property shows the number of characters currently buffered to be written. (Number of characters is approximately equal to the number of bytes to be written, but the buffer may contain strings, and the strings are lazily encoded, so the exact number of bytes is not known.)</field>
    /// <field name="remoteAddress">The string representation of the remote IP address. For example, `'74.125.127.100'` or `'2001:4860:a005::68'`.</field>
    /// <field name="remotePort">The numeric representation of the remote port. For example, `80` or `21`.</field>
    /// <field name="bytesRead">The amount of received bytes.</field>
    /// <field name="bytesWritten">The amount of bytes sent.</field>
    /// 
    /// <returns type='Net.Socket' />


    this.connect = function (port, host, connectListener) {
        /// <summary>
        /// Opens the connection for a given socket. <br />
        /// If port and host are given, then the socket will be opened as a TCP socket, if host is omitted, localhost will be assumed. <br />
        /// If a path is given, the socket will be opened as a unix socket to that path.<br />
        /// Normally this method is not needed, as net.createConnection opens the socket.<br />
        /// Use this only if you are implementing a custom Socket or if a Socket is closed and you want to reuse it to connect to another server.<br />
        /// This function is asynchronous. When the 'connect' event is emitted the socket is established. If there is a problem connecting, the 'connect' event will not be emitted, the 'error' event will be emitted with the exception.
        /// </summary>
        /// <param name='port' type='Number'>port number.</param>
        /// <param name='host' type='String' optional='true'>path</param>
        /// <param name='connectListener' value='connectListener(new Net.Socket())' optional='true'>
        /// The connectListener parameter will be added as an listener for the 'connect' event.
        /// </param>
    };
    this.setEncoding = function (encoding) {
        /// <summary>Set the encoding for the socket as a Readable Stream. See stream.setEncoding() for more information.</summary>
        /// <param name='encoding' type='String' optional='true' />
    };
    this.write = function (data, encoding, callback) {
        /// <summary>
        /// Sends data on the socket. The second parameter specifies the encoding in the case of a string--it defaults to UTF8 encoding.<br />
        /// Returns true if the entire data was flushed successfully to the kernel buffer. <br />
        /// Returns false if all or part of the data was queued in user memory. <br />
        /// 'drain' will be emitted when the buffer is again free.
        /// </summary>
        /// <param name='data' type='Object'>data.(buffer)</param>
        /// <param name='encoding' type='String' optional='true'>exp. 'utf8', 'base64', null(raw buffer)..</param>
        /// <param name='callback' value='callback()' optional='true'>
        /// The optional callback parameter will be executed when the data is finally written out - this may not be immediately.
        /// </param>
    };
    this.end = function (data, encoding) {
        /// <summary>
        /// Half-closes the socket. i.e., it sends a FIN packet. It is possible the server will still send some data.<br />
        /// If data is specified, it is equivalent to calling socket.write(data, encoding) followed by socket.end().
        /// </summary>
        /// <param name='data' type='Object'>data.(buffer)</param>
        /// <param name='encoding' type='String' optional='true'>exp. 'utf8', 'base64', null(raw buffer)..</param>
    };
    this.destroy = function () {
        /// <summary>Ensures that no more I/O activity happens on this socket. Only necessary in case of errors (parse error or so).</summary>
    };
    this.pause = function () {
        /// <summary>Pauses the reading of data. That is, 'data' events will not be emitted. Useful to throttle back an upload.</summary>
    };
    this.resume = function () {
        /// <summary>Resumes reading after a call to pause().</summary>
    };
    this.setTimeout = function (timeout, callback) {
        /// <summary>Sets the socket to timeout after timeout milliseconds of inactivity on the socket. By default net.Socket do not have a timeout.</summary>
        /// <param name='timeout' type='Number' >milli second. <br />If timeout is 0, then the existing idle timeout is disabled.</param>
        /// <param name='callback' value='callback()' optional='true'>
        /// The optional callback parameter will be added as a one time listener for the 'timeout' event.
        /// </param>
    };
    this.setNoDelay = function (noDelay) {
        /// <summary>Disables the Nagle algorithm.</summary>
        /// <param name='noDelay' type='Number' optional='true'>
        /// By default TCP connections use the Nagle algorithm, they buffer data before sending it off. <br />
        /// Setting true for noDelay will immediately fire off data each time socket.write() is called. noDelay defaults to true.
        /// </param>
    };
    this.setKeepAlive = function (enable, initialDelay) {
        /// <summary>Enable/disable keep-alive functionality, and optionally set the initial delay before the first keepalive probe is sent on an idle socket. </summary>
        /// <param name='enable' type='Boolean' optional='true' >default : false</param>
        /// <param name='initialDelay' type='Number' optional='true'>
        /// Set initialDelay (in milliseconds) to set the delay between the last data packet received and the first keepalive probe. <br />
        /// Setting 0 for initialDelay will leave the value unchanged from the default (or previous) setting. Defaults to 0.
        /// </param>
    };
    this.address = function () {
        /// <summary>Returns the bound address, the address family name and port of the socket as reported by the operating system. <br />
        /// Returns an object with three properties, e.g. { port: 12346, family: 'IPv4', address: '127.0.0.1' }</summary> 
        /// <returns type="Object" />
        return new Object();
    };
    //net.Socket has the property that socket.write() always works.
     this.bufferSize = new Number();
    //The string representation of the remote IP address. For example, '74.125.127.100' or '2001:4860:a005::68'.
    this.remoteAddress = new String();
    //The numeric representation of the remote port. For example, 80 or 21.
    this.remotePort = new Number();
    //The amount of received bytes.
    this.bytesRead = new Number();
    //The amount of bytes sent.
    this.bytesWritten = new Number();
    
    // -- eventEmitter --
    this.on = function (event, listener) {
        /// <summary>
        /// event method. 
        /// </summary>
        /// <param name='event' type='String'>
        /// event name.<br />
        /// 'connect', 'data', 'end', 'timeout', 'drain', 'error', 'close'
        /// </param>  
        /// <param name='listener' type='Function'>listenr function.</param>
    };
    this.addListener = function (event, listener) {
        ///<summary>Adds a listener to the end of the listeners array for the specified event.</summary>
        ///<param name="event">event name.</param>
        ///<param name="listener">listener function.</param>
    };
    this.once = function(event, listener) {
        ///<summary>
        /// Adds a **one time** listener for the event. 
        /// This listener is invoked only the next time the event is fired, after which it is removed.
        /// </summary>
        ///<param name="event">event name.</param>
        ///<param name="listener">listener function.</param>
    };
    this.removeListener = function(event, listener) {
        ///<summary>Remove a listener from the listener array for the specified event. **Caution**: changes array indices in the listener array behind the listener.</summary>
        ///<param name="event">event name.</param>
        ///<param name="listener">listener function.</param>
    };
    this.removeAllListeners = function(event) {
        ///<summary>Removes all listeners, or those of the specified event.</summary>
        ///<param name="event" optional="true">event name.</param>
    };
    this.setMaxListeners = function(n) {
        ///<summary>By default EventEmitters will print a warning if more than 10 listeners are added for a particular event. This is a useful default which helps finding memory leaks. Obviously not all Emitters should be limited to 10. This function allows that to be increased. Set to zero for unlimited.</summary>
        ///<param name="n"></param>
    };
    this.listeners = function(event) {
        ///<summary>Returns an array of listeners for the specified event. This array can be manipulated, e.g. to remove listeners.</summary>
        ///<param name="event">event name.</param>
    };
    this.emit = function(event, arg1, arg2) {
        ///<summary>Execute each of the listeners in order with the supplied arguments.</summary>
        ///<param name="event">event name.</param>
        ///<param name="arg1" optional="true"></param>
        ///<param name="arg2" optional="true"></param>
    };


    if (this instanceof Net.Socket)
        return new Net.Socket();
    else
        return this;
};


require.modules.net.Server = function () {
    this.listen = function (port, host, backlog, listeningListener) {
        /// <summary>
        /// Begin accepting connections on the specified port and host. 
        /// </summary>
        /// <param name="port">Port Number. A port value of zero will assign a random port.</param>
        /// <param name="host" optional='true'>If the host is omitted, the server will accept connections directed to any IPv4 address (INADDR_ANY). </param>
        /// <param name="backlog" optional='true'>
        /// Backlog is the maximum length of the queue of pending connections. 
        /// The actual length will be determined by your OS through sysctl settings such as tcp_max_syn_backlog and somaxconn on linux. 
        /// The default value of this parameter is 511 (not 512).
        /// </param>
        /// <param name="listeningListener optional='true'">
        /// This function is asynchronous. When the server has been bound, 'listening' event will be emitted. 
        /// The last parameter callback will be added as an listener for the 'listening' event.
        /// </param>  
        /// <field name="maxConnections">Set this property to reject connections when the server's connection count gets high.</field>  
        /// <field name="connections">The number of concurrent connections on the server.</field>  
    };
    this.close = function (cb) {
        /// <param name='cb' value='cb()' optional='true' />
    };
    this.address = function () {
        /// <returns type='Object' />
        return { port: 0, family: '', address: '' };
    };
    this.maxConnections = new Number();
    this.connections = new Number();
    this.on = function (event, listener) {
        /// <summary>
        /// event method. 
        /// </summary>
        /// <param name='event' type='String'>
        /// event name.<br />
        /// 'listening', 'connection', 'close', 'error'
        /// </param>  
        /// <param name='listener' type='Function'>listenr function.</param>
    };
};

require.modules.net.Server.prototype = new Net.Socket();
