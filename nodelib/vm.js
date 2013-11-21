require.modules.vm = new function () {
    /// <summary>
    /// JavaScript code can be compiled and run immediately or compiled, saved, and run later.
    /// </summary>
    this.runInThisContext = function (code, filename) {
        /// <summary>
        /// vm.runInThisContext() compiles code, runs it and returns the result. 
        /// Running code does not have access to local scope. 
        /// filename is optional, it"s used only in stack traces.
        /// </summary>
        /// <param name="code" type="String" />
        /// <param name="filename" type="String" optional="true" />
        /// <returns type="Object" />
        return new Object();
    };
    this.runInNewContext = function (code, sandbox, filename) {
        /// <summary>
        /// vm.runInNewContext compiles code, then runs it in sandbox and returns the result. 
        /// Running code does not have access to local scope. 
        /// The object sandbox will be used as the global object for code. 
        /// sandbox and filename are optional, filename is only used in stack traces.
        /// </summary>
        /// <param name="code" type="String" />
        /// <param name="sandbox" type="Object" optional="true" />
        /// <param name="filename" type="String" optional="true" />
        /// <returns type="Object" />
        return new Object();
    };
    this.runInContext = function (code, context, filename) {
        /// <summary>
        /// vm.runInContext compiles code, then runs it in context and returns the result. 
        /// A (V8) context comprises a global object, together with a set of built-in objects and functions. 
        /// Running code does not have access to local scope and the global object held within context 
        /// will be used as the global object for code. filename is optional, it"s used only in stack traces.
        /// </summary>
        /// <param name="code" type="String" />
        /// <param name="context" type="Object" />
        /// <param name="filename" type="String" optional="true" />
        /// <returns type="Object" />
        return new Object();
    };
    this.createContext = function (initSandbox) {
        /// <summary>
        /// vm.createContext creates a new context which is suitable for use as the 2nd argument of a subsequent call to vm.runInContext. 
        /// A (V8) context comprises a global object together with a set of build-in objects and functions. 
        /// The optional argument initSandbox will be shallow-copied to seed the initial contents of the global object used by the context.
        /// </summary>
        /// <param name="initSandbox" type="Object" optional="true" />
        /// <returns type="Object" optional="true" />
        return new Object();
    };
    this.createScript = function (code, filename) {
        /// <summary>
        /// createScript compiles code but does not run it. Instead, 
        /// it returns a vm.Script object representing this compiled code. 
        /// This script can be run later many times using methods below. 
        /// The returned script is not bound to any global object. 
        /// It is bound before each run, just for that run. filename is optional, it"s only used in stack traces
        /// </summary>
        /// <param name="code" type="String" />
        /// <param name="filename" type="String" optional="true" />
        /// <returns type="VM.Script" />
    	return new require.modules.vm.Script();
    };
};

require.modules.vm.Script = function () {
    /// <summary>A class for running scripts. Returned by vm.createScript.</summary>
    this.runInThisContext = function() {
    	/// <summary>
        /// Similar to vm.runInThisContext but a method of a precompiled Script object. script.runInThisContext runs 
        /// the code of script and returns the result. 
        /// Running code does not have access to local scope, 
    	/// but does have access to the global object (v8: in actual context).
    	/// </summary>
    };
    this.runInNewContext = function (sandbox) {
        /// <summary>
        /// Similar to vm.runInNewContext a method of a precompiled Script object. 
        /// script.runInNewContext runs the code of script with sandbox as the global object and returns the result. 
        /// Running code does not have access to local scope. sandbox is optional.
        /// </summary>
    };
};
