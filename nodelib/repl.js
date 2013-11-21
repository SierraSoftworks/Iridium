require.modules.repl = new function () {
    /// <summary>
    /// A Read-Eval-Print-Loop (REPL) is available both as a standalone program <br />
    /// and easily includable in other programs. The REPL provides a way to <br />
    /// interactively run JavaScript and see the results. It can be used for <br />
    /// debugging, testing, or just trying things out.
    /// </summary>
    this.start = function (options) {
        /// <summary>
        /// Returns and starts a REPLServer instance. 
        /// </summary>
        /// <param name='options' type='Object' />
    };
    
    ////Event: 'exit'
    this.on = function (event, listener) {
        /// <summary>
        /// event method. 
        /// </summary>
        /// <param name='event' type='String'>
        /// event name.<br />
        /// 'exit'
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
