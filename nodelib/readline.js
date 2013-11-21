require.modules.readline = new function () {
    this.createInterface = function (options) {
        ///<summary>Interface to streams used for readline.</summary>
        return new require.modules.readline.Interface();
    };
    this.on = function (event, listener) {
        /// <summary>
        /// event method. 
        /// </summary>
        /// <param name='event' type='String'>
        /// event name.<br />
        ///'line', 'pause', 'resume', 'close', 'SIGINT', 'SIGTSTP', 'SIGCONT'
        /// </param>  
        /// <param name='listener' type='Function'>listenr function.</param>
    };
    this.addListener = function (event, listener) {
        ///<summary>Adds a listener to the end of the listeners array for the specified event.</summary>
        ///<param name="event"></param>
        ///<param name="listener"></param>
    };
    this.once = function (event, listener) {
        ///<summary>Adds a **one time** listener for the event. This listener is invoked only the next time the event is fired, after which it is removed.</summary>
        ///<param name="event"></param>
        ///<param name="listener"></param>
    };
    this.removeListener = function (event, listener) {
        ///<summary>Remove a listener from the listener array for the specified event. **Caution**: changes array indices in the listener array behind the listener.</summary>
        ///<param name="event"></param>
        ///<param name="listener"></param>
    };
    this.removeAllListeners = function (event) {
        ///<summary>Removes all listeners, or those of the specified event.</summary>
        ///<param name="event" optional="true"></param>
    };
    this.setMaxListeners = function (n) {
        ///<summary>By default EventEmitters will print a warning if more than 10 listeners are added for a particular event. This is a useful default which helps finding memory leaks. Obviously not all Emitters should be limited to 10. This function allows that to be increased. Set to zero for unlimited.</summary>
        ///<param name="n"></param>
    };
    this.listeners = function (event) {
        ///<summary>Returns an array of listeners for the specified event. This array can be manipulated, e.g. to remove listeners.</summary>
        ///<param name="event"></param>
    };
    this.emit = function (event, arg1, arg2) {
        ///<summary>Execute each of the listeners in order with the supplied arguments.</summary>
        ///<param name="event"></param>
        ///<param name="arg1" optional="true"></param>
        ///<param name="arg2" optional="true"></param>
    };

};


require.modules.readline.Interface = function () {
    this.setPrompt = function (prompt, length) {
        ///<summary>Sets the prompt, for example when you run `node` on the command line, you see `> `, which is node's prompt.</summary>
        ///<param name="prompt"></param>
        ///<param name="length"></param>
    };
    this.prompt = function (preserveCursor) {
        ///<summary>Readies readline for input from the user, putting the current `setPrompt` options on a new line, giving the user a new spot to write.</summary>
        /// <param name='preserveCursor' type='Boolean' optional='true' />
    };
    this.question = function (query, callback) {
        ///<summary>Prepends the prompt with `query` and invokes `callback` with the user's response. Displays the query to the user, and then invokes `callback` with the user's response after it has been typed.</summary>
        /// <param name='query' type='String' />
        /// <param name='callback' value='callback(new String())' />
    };
    this.pause = function() {
        ///<summary>Prepends the prompt with `query` and invokes `callback` with the user's response. Displays the query to the user, and then invokes `callback` with the user's response after it has been typed.</summary>
    };
    this.resume = function() {
        ///<summary>Resumes tty.</summary>
    };
    this.close = function() {
        ///<summary>Closes tty.</summary>
    };
    this.write = function (data, key) {
        ///<summary>Writes to tty.</summary>
        /// <param name='data' type='Object'  />
        /// <param name='key' type='Object' optional='true' />
    };
};
