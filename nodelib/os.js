require.modules.os = new function () {
    /// <summary>
    /// Provides a few basic operating-system related utility functions.
    /// Use require('os') to access this module.
    /// </summary>
    this.tmpdir = function() {
    	/// <summary>
        /// Returns the operating system's default directory for temp files.
        /// </summary>
        /// <returns type='String'> </returns>
        return new String;
    };
    this.hostname = function () {
        /// <summary>Returns the hostname of the operating system.</summary>
        /// <returns type='String' />
        return new String();
    };
    this.type = function () {
        /// <summary>Returns the operating system name.</summary>
        /// <returns type='String' />
        return new String();
    };
    this.platform = function () {
        /// <summary>Returns the operating system platform.</summary>
        /// <returns type='String' />
        return new String();
    };
    this.arch = function () {
        /// <summary>Returns the operating system CPU architecture.</summary>
        /// <returns type='String' />
        return new String();
    };
    this.release = function () {
        /// <summary>Returns the operating system release.</summary>
        /// <returns type='String' />
        return new String();
    };
    this.uptime = function () {
        /// <summary>Returns the system uptime in seconds.</summary>
        /// <returns type='Number' />
        return new Number();
    };
    this.loadavg = function () {
        /// <summary>Returns an array containing the 1, 5, and 15 minute load averages.</summary>
        /// <returns type='Array' />
        return new Array();
    };
    this.totalmem = function () {
        /// <summary>Returns the total amount of system memory in bytes.</summary>
        /// <returns type='Number' />
        return new Number();
    };
    this.freemem = function () {
        /// <summary>Returns the amount of free system memory in bytes.</summary>
        /// <returns type='Number' />
        return new Number();
    };
    this.cpus = function () {
        /// <summary>
        /// Returns an array of objects containing information about each <br />
        /// CPU/core installed: model, speed (in MHz), and times (an object <br />
        /// containing the number of CPU ticks spent in: user, nice, sys, idle, <br />
        /// and irq).
        /// </summary>
        /// <returns type='Object' />
        return new Object();
    };
    this.networkInterfaces = function () {
        /// <summary>
        /// Get a list of network interfaces
        /// </summary>
        /// <returns type='Object' />
        return new Object();
    };
    this.EOL = new String();
};
