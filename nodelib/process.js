/// <reference path="core.js" />
/// <reference path="events.js"/>
/// <reference path="stream.js"/>

require.modules.process = function () {
    /// <summary>
    /// The process object is a global object and can be accessed from anywhere. It is an instance of EventEmitter.
    /// </summary>
    /// <field name='stdout' type='Stream'>
    /// A Writable Stream to stdout.
    /// </field>
    /// <field name='stderr' type='Stream'>
    /// A writable stream to stderr.
    /// </field>
    /// <field name='stdin' type='Stream'>
    /// A Readable Stream for stdin. The stdin stream is paused by default, so <br />
    /// one must call process.stdin.resume() to read from it.
    /// </field>
    /// <field name='argv' type='Array'>
    /// An array containing the command line arguments. The first element will <br />
    /// be 'node', the second element will be the name of the JavaScript file. <br />
    /// The next elements will be any additional command line arguments.
    /// </field>
    /// <field name='execPath' type='String'>
    /// This is the absolute pathname of the executable that started the process.
    /// </field>
    /// <field name='env' type='String'>
    /// An object containing the user environment. 
    /// </field>
    /// <field name='version' type='Number'>
    /// A compiled-in property that exposes NODE_VERSION.
    /// </field>
    /// <field name='versions' type='Object'>
    /// A property exposing version strings of node and its dependencies.
    /// </field>
    /// <field name='config' type='Object'>
    /// An Object containing the JavaScript representation of the configure <br />
    /// options that were used to compile the current node executable. This is <br />
    /// the same as the "config.gypi" file that was produced when running <br />
    /// the ./configure script.
    /// </field>
    /// <field name='pid' type='Number'>
    /// AThe PID of the process.
    /// </field>
    /// <field name='title' type='String'>
    /// Getter/setter to set what is displayed in 'ps'.
    /// </field>
    /// <field name='arch' type='String'>
    /// What processor architecture you're running on: 'arm', 'ia32', or 'x64'.
    /// </field>
    /// <field name='platform' type='String'>
    /// What platform you're running on: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    /// </field>
    
    this.stdout = new Stream();
    this.stderr = new Stream();
    this.stdin = new Stream();
    this.argv = new Array();
    this.execPath = new String();
    this.abort = function() {
    	/// <summary>
        /// This causes node to emit an abort. This will cause node to exit and generate a core file.
    	/// </summary>
    };
    this.chdir = function (directory) {
        /// <summary>
        /// Changes the current working directory of the process or throws an exception if that fails.
        /// </summary>
        /// <param name='directory' type='String' />
    };
    this.cwd = function () {
        /// <summary>
        /// Returns the current working directory of the process.
        /// </summary>
        /// <returns type='String' />
        return new String();
    };
    this.env = new String();
    this.exit = function (code) {
        /// <summary>
        /// Ends the process with the specified code. If omitted, exit uses the 'success' code 0.
        /// </summary>
        /// <param name='code' type='Number' />
    };
    this.getgid = function () {
        /// <summary>
        /// Gets the group identity of the process. (See getgid.) This is the <br />
        /// numerical group id, not the group name.
        /// Note: this function is only available on POSIX platforms (i.e. not Windows)
        /// </summary>
        /// <returns type='Number' />
        return new Number();
    };
    this.setgid = function (id) {
        /// <summary>
        /// Sets the group identity of the process. (See setgid.) This <br />
        /// accepts either a numerical ID or a groupname string. If a groupname <br />
        /// is specified, this method blocks while resolving it to a numerical ID.
        /// Note: this function is only available on POSIX platforms (i.e. not Windows)
        /// </summary>
        /// <param name='id' type='Number' />
    };
    this.getuid = function () {
        /// <summary>
        /// Gets the user identity of the process. (See getuid.) This is the <br />
        /// numerical userid, not the username.<br />
        /// Note: this function is only available on POSIX platforms (i.e. not Windows)
        /// </summary>
        /// <returns type='Number' />
        return new Number();
    };
    this.setuid = function (id) {
        /// <summary>
        ///Sets the user identity of the process. (See setuid(2).) This accepts <br />
        /// either a numerical ID or a username string. If a username is <br />
        /// specified, this method blocks while resolving it to a numerical ID.<br />
        /// Note: this function is only available on POSIX platforms (i.e. not Windows)
        /// </summary>
        /// <param name='id' type='Number' />
    };
    this.version = new Number();
    this.versions = new Object();
    this.config = new Object();
    //this.installPrefix = new String();
    this.kill = function (pid, signal) {
        /// <summary>
        /// Send a signal to a process. pid is the process id and signal is the <br />
        /// string describing the signal to send. Signal names are strings like <br />
        /// 'SIGINT' or 'SIGUSR1'. If omitted, the signal will be 'SIGTERM'. See <br />
        /// kill for more information.
        /// </summary>
        /// <param name='pid' type='Number' />
        /// <param name='signal' type='String' optional='true' />
    };
    this.pid = new Number();
    this.title = new String();
    this.arch = new String();
    this.platform = new String();
    this.memoryUsage = function () {
        /// <summary>
        /// Returns an object describing the memory usage of the Node process measured in bytes.
        /// </summary>
        /// <returns type='Number' />
        return new Number();
    };
    this.nextTick = function (callback) {
        /// <summary>
        /// On the next loop around the event loop call this callback. This is <br />
        /// not a simple alias to setTimeout(fn, 0), it's much more efficient.
        /// </summary>
        /// <param name='callback' value='callback(n)' optional='true' />
    };
    this.umask = function (mask) {
        /// <summary>
        /// Sets or reads the process's file mode creation mask. Child <br />
        /// processes inherit the mask from the parent process. Returns the <br />
        /// old mask if mask argument is given, otherwise returns the current <br />
        /// mask.
        /// </summary>
        /// <param name='mask' type='Object' optional='true' />
        /// <returns type='Number' />
        return new Number();
    };
    this.uptime = function () {
        /// <summary>
        /// Number of seconds Node has been running.
        /// </summary>
        /// <returns type='Number' />
        return new Number();
    };
    this.hrtime = function () {
        /// <summary>
        /// Returns the current high-resolution real time in <br />
        /// a [seconds, nanoseconds] tuple Array. It is relative to an <br />
        /// arbitrary time in the past. It is not related to the time of day <br />
        /// and therefore not subject to clock drift. The primary use is for <br />
        /// measuring performance between intervals.
        /// </summary>
        /// <returns type='Array' />
        return new Array();
    };
};

require.modules.process.prototype = new require.modules.events.EventEmitter();

require.modules.process = new require.modules.process();