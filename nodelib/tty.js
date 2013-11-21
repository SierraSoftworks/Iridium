/// <reference path="net.js"/>

require.modules.tty = new function () {
    /// <summary>
    /// The tty module houses the tty.ReadStream and tty.WriteStream classes. In <br />
    /// most cases, you will not need to use this module directly.
    /// </summary>
    this.isatty = function (fd) {
        /// <summary>
        /// Returns true or false depending on if the fd is associated with a terminal.
        /// </summary>
        /// <param name='fd' type='Number' />file descriptor</param>
        /// <returns type='Boolean' />
        return new Boolean();
    };
    //this.setRawMode = function(mode){};
    this.ReadStream = function () {
        /// <summary>
        /// A net.Socket subclass that represents the readable portion of a <br />
        /// tty. In normal circumstances, process.stdin will be the only <br />
        /// tty.ReadStream instance in any node program (only when isatty(0) is <br />
        /// true).
        /// </summary>
        /// <field name="isRaw">
        /// A Boolean that is initialized to false. It represents the current "raw" state of the tty.ReadStream instance.
        /// </field>

        this.isRaw = new Boolean();
        this.setRawMode = function (mode) {
        	/// <summary>
            /// mode should be true or false. This sets the properties of the <br />
            /// tty.ReadStream to act either as a raw device or default. isRaw <br />
        	/// will be set to the resulting mode.
        	/// </summary>
        	/// <param name="mode"></param> 
        };
    };
    this.ReadStream.prototype = new require.modules.net.Socket();

    this.WriteStream = function () {
        /// <summary>
        /// A net.Socket subclass that represents the writable portion of a tty. <br />
        /// In normal circumstances, process.stdout will be the only <br />
        /// tty.WriteStream instance ever created (and only when isatty(1) is <br />
        /// true).
        /// </summary>
        /// <field name="columns">
        /// A Number that gives the number of columns the TTY currently has. This property gets updated on "resize" events.
        /// </field>
        /// <field name="rows">
        /// A Number that gives the number of rows the TTY currently has. This property gets updated on "resize" events.
        /// </field>

        this.columns = new Number();
        this.rows = new Number();
        ////Event: 'resize'
    };
    this.WriteStream.prototype = new require.modules.net.Socket();
};
