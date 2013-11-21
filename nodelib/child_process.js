/// <reference path="core.js" />
/// <reference path="buffer.js"/>
/// <reference path="events.js"/>
/// <reference path="stream.js"/>

(function () {
    require.modules.child_process = {
        spawn: function (command, args, options) {
            ///<summary>
            /// Launches a new process with the given `command`, with command line arguments in `args`. <br />
            /// If omitted, `args` defaults to an empty Array.<br />
            /// </summary>
            /// <param name="command" type="String">The command to run.</param>
            /// <param name="args" type="Array" optional="true">Array List of string arguments.</param>
            /// <param name="options" type="Object" optional="true"></param>
            return new ChildProcess();
        },
        exec: function (command, options, callback) {
            /// <summary>
            /// Runs a command in a shell and buffers the output.
            /// </summary>
            /// <param name="command" type="String">The command to run, with space-separated arguments.</param>
            /// <param name="options" type="Object" optional="true"></param>
            /// <param name="callback" type="Function">Function called with the output when process terminates.</param>
            return new ChildProcess();
        },
        execFile: function (file, args, options, callback) {
            ///<summary>
            /// This is similar to `child_process.exec()` except it does not execute a subshell but rather the specified file directly. <br />
            /// This makes it slightly leaner than `child_process.exec`. It has the same options.
            /// </summary>
            /// <param name="file" type="String">The filename of the program to run.</param>
            /// <param name="args" type="Array">Array List of string arguments.</param>
            /// <param name="options" type="Object"></param>
            /// <param name="callback" type="Function">Function called with the output when process terminates.</param>
            /// <returns type='HTTP.ClientRequest' />
            return new ChildProcess();
        },
        fork: function (modulePath, args, options) {
            ///<summary>
            /// This is a special case of the `spawn()` functionality for spawning Node processes. <br />
            /// In addition to having all the methods in a normal ChildProcess instance, <br />
            /// the returned object has a communication channel built-in. <br />
            /// The channel is written to with `child.send(message)` and messages are recieved by a `'message'` event on the child.
            /// </summary>
            /// <param name="modulePath" type="String"></param>
            /// <param name="arguments" type="Array" optional="true">Array List of string arguments.</param>
            /// <param name="options" type="Object" optional="true"></param>
            /// <returns type='HTTP.ClientRequest' />
            return new ChildProcess();
        }
    };

    var ChildProcess = function () {
        /// <summary>An instance of a child process created by the child_process library.</summary>
        /// <field name="stdin">
        /// A Writable Stream that represents the child process's stdin. <br/> 
        /// Closing this stream via end() often causes the child process to terminate.
        /// </field>
        /// <field name="stdout">A Readable Stream that represents the child process's stdout.</field>
        /// <field name="stderr">A Readable Stream that represents the child process's stderr.</field>
        /// <field name="pid">The PID of the child process.</field>


        ////Event: 'exit'
        ////Event: 'close'
        ////Event: 'disconnect'
        ////Event: 'message'    
        this.stdin = new Stream();
        this.stdout = new Stream();
        this.stderr = new Stream();
        this.pid = new Number();
        this.kill = function (signal) {
            /// <summary>
            /// Send a signal to the child process. <br />
            /// If no argument is given, the process will be sent 'SIGTERM'. <br />
            /// See signal for a list of available signals.
            /// </summary>
            /// <param name='signal' type='String' optional='true' />
        };
        this.send = function (message, sendHandle) {
            /// <summary>Send a message (and, optionally, a handle object) to a child process.</summary>
            /// <param name='message' type='Object' />
            /// <param name='sendHandle' type='Object' optional='true' />
        };
        this.disconnect = function () { };
    };

    var EventEmitter = require("events").EventEmitter;
    ChildProcess.prototype = new EventEmitter();
})();