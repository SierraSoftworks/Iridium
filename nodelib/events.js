/// <reference path="core.js" />
require.modules.events = {
    EventEmitter: function () {
        /// <summary>
        /// When an EventEmitter instance experiences an error, 
        /// the typical action is to emit an 'error' event. Error events are treated as a special case in node. 
        /// If there is no listener for it, then the default action is to print a stack trace and exit the program.
        /// </summary>
        /// <returns type="Object">EventEmitter class</returns>
        this.addListener = function (event, listener) {
            /// <summary>
            /// Adds a listener to the end of the listeners array for the specified event.
            /// </summary>
            /// <param name='event' type='String' />
            /// <param name='listener' type='Function' />
        };
        this.on = function (event, listener) {
            /// <summary>
            /// Adds a listener to the end of the listeners array for the specified event.
            /// </summary>
            /// <param name='event' type='String' />
            /// <param name='listener' type='Function' />
        };
        this.once = function (event, listener) {
            /// <summary>
            /// Adds a one time listener for the event. This listener is invoked only the next time the event is fired, 
            /// after which it is removed.
            /// </summary>
            /// <param name='event' type='String' />
            /// <param name='listener' type='Function' />
        };
        this.removeListener = function (event, listener) {
            /// <summary>
            /// Remove a listener from the listener array for the specified event. 
            /// </summary>
            /// <param name='event' type='String' />
            /// <param name='listener' type='Function' />
        };
        this.removeAllListeners = function (event) {
            /// <summary>
            /// Removes all listeners, or those of the specified event.
            /// </summary>
            /// <param name='event' type='String' />
        };
        this.setMaxListeners = function (n) {
            /// <summary>
            /// By default EventEmitters will print a warning if more than 10 listeners are added for a particular event. 
            /// This is a useful default which helps finding memory leaks. 
            /// Obviously not all Emitters should be limited to 10. 
            /// This function allows that to be increased. Set to zero for unlimited.
            /// </summary>
            /// <param name='n' type='Number' />
        };
        this.listeners = function (event) {
            /// <summary>
            /// Returns an array of listeners for the specified event.
            /// </summary>
            /// <param name='event' type='String' />
            /// <returns type='Array' />
            return new Array();
        };
        this.emit = function (event, arg1) {
            /// <summary>
            /// Execute each of the listeners in order with the supplied arguments.
            /// </summary>
            /// <param name='event' type='String'>event handler.</param>
            /// <param name='arg1' type='String'>event message.</param>
        };
    }
};
