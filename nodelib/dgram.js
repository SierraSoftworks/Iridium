/// <reference path="buffer.js"/>

require.modules.crypto.dgram = {
    createSocket: function (type, callback) {
        /// <summary>
        /// Creates a datagram Socket of the specified types. Valid types are udp4 and udp6.
        /// Takes an optional callback which is added as a listener for message events.
        /// </summary>
        /// <param name='type' type='String'>
        /// Either 'udp4' or 'udp6'.
        /// </param>
        /// <param name='callback' value='callback(new Buffer(),new Object())' optional='true'>
        ///  Attached as a listener to message events. Optional.
        /// </param>
        /// <returns type='Dgram.Socket'>Socket object</returns>
    	return new require.modules.crypto.dgram.Socket();
    }
};

require.modules.crypto.dgram.Socket = function (type, callback) {
    /// <summary>
    /// The dgram Socket class encapsulates the datagram functionality. <br />
    /// It should be created via dgram.createSocket(type, [callback]).
    /// </summary>

    this.send = function (buf, offset, length, port, address, callback) {
        /// <summary>
        /// For UDP sockets, the destination port and IP address must be specified. <br />
        /// A string may be supplied for the address parameter, and it will be resolved <br />
        /// with DNS. An optional callback may be specified to detect any DNS errors and <br />
        /// when buf may be re-used. Note that DNS lookups will delay the time that a <br />
        /// send takes place, at least until the next tick. The only way to know for sure <br />
        /// that a send has taken place is to use the callback.
        /// </summary>
        /// <param name='buf' type='Buffer'>Message to be sent</param>
        /// <param name='offset' type='Number'>Offset in the buffer where the message starts.</param>
        /// <param name='length' type='Number'>Number of bytes in the message.</param>
        /// <param name='port' type='Number'>destination port.</param>
        /// <param name='address' type='String'>destination IP</param>
        /// <param name='callback' value='callback(new Error(),new Number())' optional='true'>
        /// Callback when message is done being delivered. Optional.
        /// </param>
    };
    this.bind = function(port, address) {
    	/// <summary>
        /// For UDP sockets, listen for datagrams on a named port and optional address. <br />
    	/// If address is not specified, the OS will try to listen on all addresses.
    	/// </summary>
        /// <param name="port" type='Number'></param>
        /// <param name="address" type='String' optional='true'></param>
    };
    this.close = function() {
    	/// <summary>
        /// Close the underlying socket and stop listening for data on it.
    	/// </summary>
    };
    this.address = function() {
    	/// <summary>
        /// Returns an object containing the address information for a socket. For UDP sockets, <br />
    	/// this object will contain address , family and port.
    	/// </summary>
    	/// <returns type="Object"></returns>
        return new Object();
    };
    this.setBroadcast = function(flag) {
    	/// <summary>
        /// Sets or clears the SO_BROADCAST socket option. When this option is set, UDP packets may <br />
    	/// be sent to a local interface's broadcast address.
    	/// </summary>
        /// <param name="flag" type="Boolean"></param>
    };
    this.setTTL = function (ttl) {
        /// <summary>
        /// Sets the IP_TTL socket option. TTL stands for "Time to Live," but in this context it <br />
        /// specifies the number of IP hops that a packet is allowed to go through. Each router or <br />
        /// gateway that forwards a packet decrements the TTL. If the TTL is decremented to 0 by a <br />
        /// router, it will not be forwarded. Changing TTL values is typically done for network <br />
        /// probes or when multicasting.
        /// </summary>
        /// <param name='ttl' type='Number' />
    };
    this.setMulticastTTL = function (ttl) {
        /// <summary>
        /// Sets or clears the IP_MULTICAST_LOOP socket option. When this option is set, multicast <br />
        /// packets will also be received on the local interface.
        /// </summary>
        /// <param name='ttl' type='Number' />
    };
    this.setMulticastLoopback = function (flag) {
        /// <summary>
        /// Sets or clears the IP_MULTICAST_LOOP socket option. When this option is set, multicast <br />
        /// packets will also be received on the local interface.
        /// </summary>
        /// <param name='flag' type='Boolean' />
    };
    this.addMembership = function (multicastAddress, multicastInterface) {
        /// <summary>
        /// Tells the kernel to join a multicast group with IP_ADD_MEMBERSHIP socket option.
        /// If multicastInterface is not specified, the OS will try to add membership to all valid interfaces.
        /// </summary>
        /// <param name='multicastAddress' type='String' />
        /// <param name='multicastInterface' type='String' optional='true' />
    };
    this.dropMembership = function (multicastAddress, multicastInterface) {
        /// <summary>
        /// Opposite of addMembership - tells the kernel to leave a multicast group with IP_DROP_MEMBERSHIP <br />
        /// socket option. This is automatically called by the kernel when the socket is closed or <br />
        /// process terminates, so most apps will never need to call this.
        /// </summary>
        /// <param name='multicastAddress' type='String' />
        /// <param name='multicastInterface' type='String' optional='true' />
    };
    
    ////Event: 'message'
    ////Event: 'listening'
    ////Event: 'close'
    ////Event: 'error'
    this.on = function (event, listener) {
        /// <summary>
        /// event method. 
        /// </summary>
        /// <param name='event' type='String'>
        /// event name.<br />
        /// 'message', 'listening', 'close', 'error'
        /// </param>  
        /// <param name='listener' type='Function'>listenr function.</param>
    };
    this.addListener = function (event, listener) {
        /// <summary>Adds a listener to the end of the listeners array for the specified event.</summary>
        /// <param name="event">event name.</param>
        /// <param name="listener">listener function.</param>
    };
    this.once = function (event, listener) {
        /// <summary>
        /// Adds a **one time** listener for the event.<br /> 
        /// This listener is invoked only the next time the event is fired, after which it is removed.
        /// </summary>
        /// <param name="event">event name.</param>
        /// <param name="listener">listener function.</param>
    };
    this.removeListener = function (event, listener) {
        /// <summary>
        /// Remove a listener from the listener array for the specified event. <br />
        /// **Caution**: changes array indices in the listener array behind the listener.
        /// </summary>
        /// <param name="event">event name.</param>
        /// <param name="listener">listener function.</param>
    };
    this.removeAllListeners = function (event) {
        /// <summary>
        /// Removes all listeners, or those of the specified event.
        /// </summary>
        /// <param name="event" optional="true">event name.</param>
    };
    this.setMaxListeners = function (n) {
        /// <summary>
        /// By default EventEmitters will print a warning if more than 10 listeners are added for a particular event. <br />
        /// This is a useful default which helps finding memory leaks. <br />
        /// Obviously not all Emitters should be limited to 10. <br />
        /// This function allows that to be increased. Set to zero for unlimited.
        /// </summary>
        /// <param name="n"></param>
    };
    this.listeners = function (event) {
        /// <summary>
        /// Returns an array of listeners for the specified event. <br />
        /// This array can be manipulated, e.g. to remove listeners.</summary>
        /// <param name="event">event name.</param>
    };
    this.emit = function (event, arg1, arg2) {
        /// <summary>
        /// Execute each of the listeners in order with the supplied arguments.
        /// </summary>
        /// <param name="event">event name.</param>
        /// <param name="arg1" optional="true"></param>
        /// <param name="arg2" optional="true"></param>
    };

};
