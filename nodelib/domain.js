/// <reference path="core.js" />
/// <reference path="events.js"/>

require.modules.domain = function () {
    /// <summary>
    /// Domains provide a way to handle multiple different IO operations as a <br />
    /// single group. If any of the event emitters or callbacks registered to a <br />
    /// domain emit an error event, or throw an error, then the domain object <br />
    /// will be notified, rather than losing the context of the error in the <br />
    /// process.on('uncaughtException') handler, or causing the program to exit <br />
    /// with an error code.
    /// </summary>
    /// <field name='member' type='Array'>
    /// An array of timers and event emitters that have been explicitly added to the domain.
    ///</field>
    
    this.create = function () {
        /// <summary>Returns a new Domain object.</summary>
        /// <returns type='Domain' />
        return new Domain();
    };
    this.run = function (fn) {
        /// <summary>
        /// Run the supplied function in the context of the domain, implicitly <br />
        /// binding all event emitters, timers, and lowlevel requests that are <br />
        /// created in that context.
        /// </summary>
        /// <param name='fn' type='Function' />
    };
    this.members = new Array();
    this.add = function (emitter) {
        /// <summary>
        /// Explicitly adds an emitter to the domain. If any event handlers <br />
        /// called by the emitter throw an error, or if the emitter emits an <br />
        /// error event, it will be routed to the domain's error event, just <br />
        /// like with implicit binding.
        /// </summary>
        /// <param name='emitter' type='Events.EventEmitter'>
        /// Timer emitter or timer to be added to the domain
        /// </param>
    };
    this.remove = function (emitter) {
        /// <summary>
        /// The opposite of domain.add(emitter). Removes domain handling from the specified emitter
        /// </summary>
        /// <param name='emitter' type='Events.EventEmitter'>
        /// Timer emitter or timer to be added to the domain
        /// </param>
    };
    this.bind = function (cb) {
        /// <summary>
        /// The returned function will be a wrapper around the supplied callback <br />
        /// function. When the returned function is called, any errors that are <br />
        /// thrown will be routed to the domain's error event.
        /// </summary>
        /// <param name='cb' type='Function'>
        ///  The callback function
        /// </param>
        /// <returns type='Function'>
        /// The bound function
        /// </returns>
        return new Function();
    };
    this.intercept = function (cb) {
        /// <summary>
        /// This method is almost identical to domain.bind(callback). However, <br />
        /// in addition to catching thrown errors, it will also intercept Error <br />
        /// objects sent as the first argument to the function.
        /// </summary>
        /// <param name='cb' type='Function'>
        ///  The callback function
        /// </param>
        /// <returns type='Function'>
        ///  The intercepted function
        /// </returns>
        return new Function();
    };
    this.dispose = function() {
    	/// <summary>
        /// The dispose method destroys a domain, and makes a best effort <br />
        /// attempt to clean up any and all IO that is associated with the domain. <br />
        /// Streams are aborted, ended, closed, and/or destroyed. Timers are cleared. <br />
        /// Explicitly bound callbacks are no longer called. Any error events that <br />
    	/// are raised as a result of this are ignored.
    	/// </summary>

    };
};
require.modules.domain.prototype = new require.modules.events.EventEmitter();

require.modules.domain = new require.modules.domain();