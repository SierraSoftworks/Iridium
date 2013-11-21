/// <reference path="core.js" />
/// <reference path="child_process.js"/>

require.modules.cluster = new function () {
    /// <summary>
    /// A single instance of Node runs in a single thread. <br />
    /// To take advantage of multi-core systems the user will sometimes <br />
    /// want to launch a cluster of Node processes to handle the load.
    /// </summary>
    /// <field name="settings">
    /// All settings set by the .setupMaster is stored in this settings object. <br />
    /// This object is not supposed to be change or set manually, by you.
    /// </field>
    /// <field name="isMaster">
    /// True if the process is a master. This is determined by the process.env.NODE_UNIQUE_ID. <br />
    /// If process.env.NODE_UNIQUE_ID is undefined, then isMaster is true.
    /// </field>
    /// <field name="isWorker">
    /// This boolean flag is true if the process is a worker forked from a master. <br />
    /// If the process.env.NODE_UNIQUE_ID is set to a value, then isWorker is true.
    /// </field>
    /// <field name="workers">
    /// A hash that stores the active worker objects, keyed by id field. <br />
    /// Makes it easy to loop through all the workers. It is only available in the master process.
    /// </field>


    this.settings = new Object();
    this.isMaster = new Boolean();
    this.isWorker = new Boolean();
    this.setupMaster = function (settings) {
        /// <summary>
        /// setupMaster is used to change the default 'fork' behavior. <br />
        /// The new settings are effective immediately and permanently, they cannot be changed later on.
        /// </summary>
        /// <param name='settings' type='Object' optional='true' />
    };
    this.fork = function (env) {
        /// <summary>
        /// Spawn a new worker process. This can only be called from the master process.
        /// </summary>
        /// <param name='env' type='Object' optional='true' />
        /// <returns type='require.modules.cluster.Worker' />
        new require.modules.cluster.Worker();
    };
    this.disconnect = function (callback) {
        /// <summary>
        /// When calling this method, all workers will commit a graceful suicide. <br />
        /// When they are disconnected all internal handlers will be closed, <br />
        /// allowing the master process to die graceful if no other event is waiting.
        /// </summary>
        /// <param name='callback' value='callback()' optional='true' />
    };
    this.workers = new Object();
    ////Event: 'fork'
    ////Event: 'online'
    ////Event: 'listening'
    ////Event: 'disconnect'
    ////Event: 'exit'
    ////Event: 'setup'
    
    this.on = function (event, listener) {
        /// <summary>
        /// event method. 
        /// </summary>
        /// <param name='event' type='String'>
        /// event name.<br />
        /// 'fork', 'online', 'listening', 'disconnect', 'exit', 'setup'
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

require.modules.cluster.Worker = function () {
    /// <summary>
    /// A Worker object contains all public information and method about a worker. <br />
    /// In the master it can be obtained using cluster.workers. <br />
    /// In a worker it can be obtained using cluster.worker.
    /// </summary>
    /// <field name="id">
    /// Each new worker is given its own unique id, this id is stored in the id.
    /// </field>
    /// <field name="process">
    /// All workers are created using child_process.fork(), the returned object from this function is stored in process.
    /// </field>
    /// <field name="suicid">
    /// This property is a boolean. <br />
    /// It is set when a worker dies after calling .destroy() or immediately after calling the .disconnect() method. <br />
    /// Until then it is undefined.
    /// </field>

    this.id = new String();
    this.process = new ChildProcess();
    this.suicide = new Boolean();
    this.send = function (message, sendHandle) {
        /// <summary>
        /// This function is equal to the send methods provided by child_process.fork(). <br />
        /// In the master you should use this function to send a message to a specific worker. <br />
        /// However in a worker you can also use process.send(message), since this is the same function.
        /// </summary>
        /// <param name='message' type='Object' />
        /// <param name='sendHandle' type='Object' optional='true' />
    };
    this.destroy = function() {
        /// <summary>
        /// This function will kill the worker, and inform the master to not spawn a new worker. <br />
        /// The boolean suicide lets you distinguish between voluntary and accidental exit.
        /// </summary>
    };
    this.disconnect = function() {
        /// <summary>
        /// When calling this function the worker will no longer accept new connections, <br />
        /// but they will be handled by any other listening worker. Existing connection <br />
        /// will be allowed to exit as usual. When no more connections exist, the IPC channel <br />
        /// to the worker will close allowing it to die graceful. When the IPC channel is closed <br />
        /// the disconnect event will emit, this is then followed by the exit event, there is <br />
        /// emitted when the worker finally die.
        /// Because there might be long living connections, it is useful to implement a timeout. <br />
        /// This example ask the worker to disconnect and after 2 seconds it will destroy the server. <br />
        /// An alternative would be to execute worker.destroy() after 2 seconds, but that would <br />
        /// normally not allow the worker to do any cleanup if needed.
        /// </summary>

    };
    ////Event: 'message'
    ////Event: 'online'
    ////Event: 'listening'
    ////Event: 'disconnect'
    ////Event: 'exit'
    
    this.on = function (event, listener) {
        /// <summary>
        /// event method. 
        /// </summary>
        /// <param name='event' type='String'>
        /// event name.<br />
        /// 'message', 'online', 'listening', 'disconnect', 'exit'
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
