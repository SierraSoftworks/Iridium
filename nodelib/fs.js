/// <reference path="node.js"/>
/// <reference path="stream.js"/>

require.modules.fs = new function () {
    ///<summary>File I/O is provided by simple wrappers around standard POSIX functions. All the methods have asynchronous and synchronous forms.</summary>
    ///<field name="Stats">Objects returned from `fs.stat()` and `fs.lstat()` are of this type.</field>
    ///<field name="ReadStream">`ReadStream` is a `Readable Stream`.</field>
    ///<field name="WriteStream">`WriteStream` is a `Writable Stream`.</field>

    this.rename = function (oldPath, newPath, callback) {
        /// <summary>Asynchronous rename. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='oldPath' type='String' />
        /// <param name='newPath' type='String' />
        /// <param name='callback' value='callback(new Error())' optional='true'>
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.renameSync = function (oldPath, newPath) {
        /// <summary>Synchronous rename.</summary>
        /// <param name='oldPath' type='String' />
        /// <param name='newPath' type='String' />
    };
    this.truncate = function (fd, len, callback) {
        /// <summary>Asynchronous ftruncate. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='len' type='Number' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>

    };
    this.truncateSync = function (fd, len) {
        /// <summary>Synchronous ftruncate. </summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='len' type='Number' />
    };
    this.chown = function (path, uid, gid, callback) {
        /// <summary>Asynchronous chown. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='path' type='String'>File path.</param>
        /// <param name='uid' type='Number' />
        /// <param name='gid' type='Number' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.chownSync = function (path, uid, gid) {
        /// <summary>Synchronous chown(2). No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='path' type='String'>File path.</param>
        /// <param name='uid' type='Number' />
        /// <param name='gid' type='Number' />
    };
    this.fchown = function (fd, uid, gid, callback) {
        /// <summary>Asynchronous fchown. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='uid' type='Number' />
        /// <param name='gid' type='Number' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.fchownSync = function (fd, uid, gid) {
        /// <summary>Synchronous fchown. </summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='uid' type='Number' />
        /// <param name='gid' type='Number' />
    };
    this.lchown = function (path, uid, gid, callback) {
        /// <summary>Asynchronous lchown. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='path' type='String' />
        /// <param name='uid' type='Number' />
        /// <param name='gid' type='Number' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.lchownSync = function (path, uid, gid) {
        /// <summary>Synchronous lchown. </summary>
        /// <param name='path' type='String' />
        /// <param name='uid' type='Number' />
        /// <param name='gid' type='Number' />
    };
    this.chmod = function (path, mode, callback) {
        /// <summary>Asynchronous chmod. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='path' type='String' />
        /// <param name='mode' type='Object' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.chmodSync = function (path, mode) {
        /// <summary>Synchronous chmod. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='path' type='String' />
        /// <param name='mode' type='Object' />
    };
    this.fchmod = function (fd, mode, callback) {
        /// <summary>Asynchronous fchmod. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='mode' type='Object' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.fchmodSync = function (fd, mode) {
        /// <summary>Synchronous fchmod.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='mode' type='Object' />
    };
    this.lchmod = function (path, mode, callback) {
        /// <summary>Asynchronous lchmod. No arguments other than a possible exception are given to the completion callback. <br />
        /// Only available on Mac OS X.</summary>
        /// <param name='path' type='String' />
        /// <param name='mode' type='Object' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.lchmodSync = function (path, mode) {
        /// <summary>Asynchronous lchmod. </summary>
        /// <param name='path' type='String' />
        /// <param name='mode' type='Object' />
    };
    this.stat = function (path, callback) {
        /// <summary>Asynchronous stat. The callback gets two arguments (err, stats) where stats is a fs.Stats object. </summary>
        /// <param name='path' type='String' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback gets two arguments (err, stats) where stats is a fs.Stats object.
        /// </param>
        /// <returns type='Fs.Stats' />
        return new require.modules.fs.Stats();
    };
    this.lstat = function (path, callback) {
        /// <summary>Asynchronous lstat. The callback gets two arguments (err, stats) where stats is a fs.Stats object. <br />
        /// lstat() is identical to stat(), except that if path is a symbolic link, then the link itself is stat-ed, not the file that it refers to.
        /// </summary>
        /// <param name='path' type='String' />
        /// <param name='callback' value='callback(new Error(), new Stats())' optional='true' >
        /// Callback function.<br/>
        /// The callback gets two arguments (err, stats) where stats is a fs.Stats object.
        /// </param>
        /// <returns type='Fs.Stats' />
        return new require.modules.fs.Stats();
    };
    this.fstat = function (fd, callback) {
        /// <summary>Synchronous lstat.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='callback' value='callback(new Error(), new Stats())' optional='true' >
        /// Callback function.<br/>
        /// The callback gets two arguments (err, stats) where stats is a fs.Stats object.
        /// </param>
        /// <returns type='Fs.Stats' />
        return new require.modules.fs.Stats();
    };
    this.statSync = function (path) {
        /// <summary>Synchronous stat. Returns an instance of fs.Stats.</summary>
        /// <param name='path' type='String' />
        /// <returns type='Fs.Stats' />
        return new require.modules.fs.Stats();
    };
    this.lstatSync = function (path) {
        /// <summary>Synchronous lstat. Returns an instance of fs.Stats.</summary>
        /// <param name='path' type='String' />
        /// <returns type='Fs.Stats' />
        return new require.modules.fs.Stats();
    };
    this.fstatSync = function (fd) {
        /// <summary>Synchronous fstat. Returns an instance of fs.Stats.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <returns type='Fs.Stats' />
        return new require.modules.fs.Stats();
    };
    this.link = function (srcpath, dstpath, callback) {
        /// <summary>Asynchronous link. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='srcpath' type='String' />
        /// <param name='dstpath' type='String' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.linkSync = function (srcpath, dstpath) {
        /// <summary>Synchronous link.</summary>
        /// <param name='srcpath' type='String' />
        /// <param name='dstpath' type='String' />
    };
    this.symlink = function (destination, path, type, callback) {
        /// <summary>Asynchronous symlink. No arguments other than a possible exception are given to the completion callback. <br />
        /// type argument can be either 'dir', 'file', or 'junction' (default is 'file'). <br />
        /// It is only used on Windows (ignored on other platforms). <br />
        /// Note that Windows junction points require the destination path to be absolute. <br />
        /// When using 'junction', the destination argument will automatically be normalized to absolute path.
        /// </summary>
        /// <param name='destination' type='String' />
        /// <param name='path' type='String' />
        /// <param name='type' type='String' optional='true'>
        /// type argument can be either 'dir', 'file', or 'junction' (default is 'file'). <br />
        /// It is only used on Windows (ignored on other platforms).
        /// </param>
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.symlinkSync = function (destination, path, type) {
        /// <summary>Synchronous symlink. <br />
        /// type argument can be either 'dir', 'file', or 'junction' (default is 'file'). <br />
        /// It is only used on Windows (ignored on other platforms). <br />
        /// Note that Windows junction points require the destination path to be absolute. <br />
        /// When using 'junction', the destination argument will automatically be normalized to absolute path.
        /// </summary>
        /// <param name='destination' type='String' />
        /// <param name='path' type='String' />
        /// <param name='type' type='String' optional='true'>
        /// type argument can be either 'dir', 'file', or 'junction' (default is 'file'). <br />
        /// It is only used on Windows (ignored on other platforms).
        /// </param>
    };
    this.readlink = function (path, callback) {
        /// <summary>Asynchronous readlink. The callback gets two arguments (err, linkString).</summary>
        /// <param name='path' type='String' />
        /// <param name='callback' value='callback(new Error(), new new String())' optional='true' >
        /// The callback gets two arguments (err, linkString).
        /// </param>
    };
    this.readlinkSync = function (path) {
        /// <summary>Synchronous readlink.</summary>
        /// <param name='path' type='String' />
        /// <returns type='String' />
        return new String();
    };
    this.realpath = function (path, cache, callback) {
        /// <summary>
        /// Asynchronous realpath. The callback gets two arguments (err, resolvedPath). <br />
        /// May use process.cwd to resolve relative paths. <br />
        /// </summary>
        /// <param name='path' type='String' />
        /// <param name='cache' type='String' optional='true'>
        /// cache is an object literal of mapped paths that can be used to force a specific path resolution or avoid additional fs.stat calls for known real paths.
        /// </param>
        /// <param name='callback' value='callback(new Error(),new String())'>
        /// The callback gets two arguments (err, resolvedPath).
        /// </param>
    };
    this.realpathSync = function (path, cache) {
        /// <summary>Synchronous readlink. Returns the symbolic link's string value.</summary>
        /// <param name='path' type='String' />
        /// <param name='cache' type='String' optional='true'>
        /// cache is an object literal of mapped paths that can be used to force a specific path resolution or avoid additional fs.stat calls for known real paths.
        /// </param>
        /// <returns type='String'>
        /// Returns the symbolic link's string value.
        /// </returns>
        return new String();
    };
    this.unlink = function (path, callback) {
        /// <summary>Asynchronous unlink. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='path' type='String' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.unlinkSync = function (path) {
        /// <summary>Synchronous unlink.</summary>
        /// <param name='path' type='String' />
    };
    this.rmdir = function (path, callback) {
        /// <summary>Asynchronous rmdir. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='path' type='String' />
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.rmdirSync = function (path) {
        /// <summary>Synchronous rmdir.</summary>
        /// <param name='path' type='String' />
    };
    this.mkdir = function (path, mode, callback) {
        /// <summary>Asynchronous mkdir. No arguments other than a possible exception are given to the completion callback. </summary>
        /// <param name='path' type='String' />
        /// <param name='mode' type='String' optional='true'>
        /// mode defaults to 0777.
        /// </param>
        /// <param name='callback' value='callback(new Error())' optional='true' >
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.mkdirSync = function (path, mode) {
        /// <summary>Synchronous mkdir.</summary>
        /// <param name='path' type='String' />
        /// <param name='mode' type='String' optional='true' />
    };
    this.readdir = function (path, callback) {
        /// <summary>Asynchronous readdir. Reads the contents of a directory. 
        /// </summary>
        /// <param name='path' type='String' />
        /// <param name='callback' value='callback(new Error(),new Array())' optional='true'>
        /// The callback gets two arguments (err, files) where files is an array of the names of the files in the directory excluding '.' and '..'.
        /// </param>
    };
    this.readdirSync = function (path) {
        /// <summary>Synchronous readdir. Returns an array of filenames excluding '.' and '..'.</summary>
        /// <param name='path' type='String' />
        /// <returns type='Array' />
        return new Array();
    };
    this.close = function (fd, callback) {
        /// <summary>Asynchronous close. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='callback' value='callback(new Error(),new Array())' optional='true'>
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.closeSync = function (fd) {
        /// <summary>Synchronous close. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
    };
    this.open = function (path, flags, mode, callback) {
        /// <summary>Asynchronous file open.</summary>
        /// <param name='path' type='String'>file path.</param>
        /// <param name='flags' type='String'>file open mode.drfault flag is 'r'.</param>
        /// <param name='mode' type='String' optional='true'>file premission. default permission is 0666.</param>
        /// <param name='callback' value='callback(new Error(),new Number())' optional='true' >
        /// callback function.<br />
        /// The callback is passed two arguments (err, fd), where fd is the file descriptor.
        /// </param>
    };
    this.openSync = function (path, flags, mode) {
        /// <summary>Synchronous open. Retuen value is file descriptor.</summary>
        /// <param name='path' type='String'>file path.</param>
        /// <param name='flags' type='String'>file open mode.drfault flag is 'r'.</param>
        /// <param name='mode' type='String' optional='true'>file premission. default permission is 0666.</param>
        /// <returns type='Number' >file descriptor</returns>
        return new Number();
    };
    this.utimes = function (path, atime, mtime, callback) {
        /// <summary>Change the file timestamps of a file referenced by the supplied file descriptor.</summary>
        /// <param name='path' type='String' />
        /// <param name='atime' type='Object' />
        /// <param name='mtime' type='Object' />
        /// <param name='callback' value='callback(new Error(),new Array())' optional='true'>
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.utimesSync = function (path, atime, mtime) {
        /// <summary>Change the file timestamps of a file referenced by the supplied file descriptor.</summary>
        /// <param name='path' type='String' />
        /// <param name='atime' type='Object' />
        /// <param name='mtime' type='Object' />
    };
    this.futimes = function (fd, atime, mtime, callback) {
        /// <summary>Change the file timestamps of a file referenced by the supplied file descriptor.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='atime' type='Object' />
        /// <param name='mtime' type='Object' />
        /// <param name='callback' value='callback(new Error(),new Array())' optional='true'>
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.futimesSync = function (fd, atime, mtime) {
        /// <summary>Change the file timestamps of a file referenced by the supplied file descriptor.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='atime' type='Object' />
        /// <param name='mtime' type='Object' />
    };
    this.fsync = function (fd, callback) {
        /// <summary>Asynchronous fsync. No arguments other than a possible exception are given to the completion callback.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='callback' value='callback(new Error(),new Array())' optional='true'>
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.fsyncSync = function (fd) {
        /// <summary>Synchronous fsync.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
    };
    this.write = function (fd, buffer, offset, length, position, callback) {
        /// <summary>Write buffer to the file specified by fd.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='buffer' type='Object' />
        /// <param name='offset' type='Number'>offset and length determine the part of the buffer to be written.</param>
        /// <param name='length' type='Number'>>offset and length determine the part of the buffer to be written.</param>
        /// <param name='position' type='Number'>
        /// position refers to the offset from the beginning of the file where this data should be written. <br />
        /// If position is null, the data will be written at the current position.
        /// </param>
        /// <param name='callback' value='callback(new Error(),new Number(),new Object())' optional='true'>
        /// The callback will be given three arguments (err, written, buffer) where written specifies how many bytes were written from buffer.
        /// </param>
    };
    this.writeSync = function (fd, buffer, ofthiset, length, position) {
        /// <summary>Synchronous version of fs.write(). Returns the number of bytes written.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='buffer' type='Object' />
        /// <param name='offset' type='Number'>offset and length determine the part of the buffer to be written.</param>
        /// <param name='length' type='Number'>>offset and length determine the part of the buffer to be written.</param>
        /// <param name='position' type='Number'>
        /// position refers to the offset from the beginning of the file where this data should be written. <br />
        /// If position is null, the data will be written at the current position.
        /// </param>
        /// <returns type='Number' >Returns the number of bytes written.</returns>
        return new Number();
    };
    this.read = function (fd, buffer, ofthiset, length, position, callback) {
        /// <summary>Read data from the file specified by fd.</summary>
        /// <param name='fd' type='Number' >file descriptor</param>
        /// <param name='buffer' type='Object'>buffer is  the buffer that the data will be written to.</param>
        /// <param name='offset' type='Number'>offset is offset within the buffer where reading will start.</param>
        /// <param name='length' type='Number'>length is an integer specifying the number of bytes to read.</param>
        /// <param name='position' type='Number'>
        /// position is an integer specifying where to begin reading from in the file. <br />
        /// If position is null, data will be read from the current file position.
        /// </param>
        /// <param name='callback' value='callback(new Error(),new Number(),new Object())' optional='true'>
        /// The callback is given the three arguments, (err, bytesRead, buffer).
        /// </param>
    };
    this.readSync = function (fd, buffer, ofthiset, length, position) {
        /// <summary>Synchronous version of fs.read. Returns the number of bytesRead.</summary>
        /// <param name='fd' type='Number'>file descriptor</param>
        /// <param name='buffer' type='Object'>buffer is  the buffer that the data will be written to.</param>
        /// <param name='offset' type='Number'>offset is offset within the buffer where reading will start.</param>
        /// <param name='length' type='Number'>length is an integer specifying the number of bytes to read.</param>
        /// <param name='position' type='Number'>
        /// position is an integer specifying where to begin reading from in the file. <br />
        /// If position is null, data will be read from the current file position.
        /// </param>
        /// <returns type='Number' >number of bytesRead.</returns>
        return new Number();
    };
    this.readFile = function (filename, encoding, callback) {
        /// <summary>Asynchronously reads the entire contents of a file.</summary>
        /// <param name='filename' type='String'>file path.</param>
        /// <param name='encoding' type='String' optional='true' >encoding argument. It defaults to 'utf8'.Description</param>
        /// <param name='callback' value='callback(new Error(),new Object())' optional='true'>
        /// Callback function.<br/>
        /// The callback is passed two arguments (err, data), where data is the contents of the file.
        /// </param>
    };
    this.readFileSync = function (filename, encoding) {
        /// <summary>Synchronous version of fs.readFile. </summary>
        /// <param name='filename' type='String'>file path.</param>
        /// <param name='encoding' type='String' optional='true' >encoding argument. It defaults to 'utf8'.Description</param>
        /// <returns type='Object' >the contents of the file.</returns>
        return new Object();
    };
    this.writeFile = function (filename, data, encoding, callback) {
        /// <summary>
        /// Asynchronously writes data to a file, replacing the file if it already exists. data can be a string or a buffer. 
        /// </summary>
        /// <param name='filename' type='String'>file path.</param>
        /// <param name='data' type='Object'>buffer or string.</param>
        /// <param name='encoding' type='String' optional='true' >encoding argument. It defaults to 'utf8'.Description</param>
        /// <param name='callback' value='callback(new Error())' optional='true'>callback function.</param>
    };
    this.writeFileSync = function (filename, data, encoding) {
        /// <summary>The synchronous version of fs.writeFile.</summary>
        /// <param name='filename' type='String'>file path.</param>
        /// <param name='data' type='Object'>buffer or string.</param>
        /// <param name='encoding' type='String' optional='true' >encoding argument. It defaults to 'utf8'.Description</param>
    };
    this.appendFile = function (filename, data, encoding, callback) {
        /// <summary>Asynchronously append data to a file, creating the file if it not yet exists. <br />
        /// data can be a string or a buffer. <br />
        /// The encoding argument is ignored if data is a buffer.</summary>
        /// <param name='filename' type='String' />
        /// <param name='data' type='Object' />
        /// <param name='encoding' type='String' optional='true' />
        /// <param name='callback' value='callback(new Error(),new Array())' optional='true'>
        /// Callback function.<br/>
        /// The callback will be given a arguments(err).
        /// </param>
    };
    this.appendFileSync = function (filename, data, encoding) {
        /// <summary>Synchronously append data to a file, creating the file if it not yet exists. </summary>
        /// <param name='filename' type='String' />
        /// <param name='data' type='Object' />
        /// <param name='encoding' type='String' optional='true' />
    };
    this.watchFile = function (filename, options, listener) {
        /// <summary>Asynchronously writes data to a file, replacing the file if it already exists. data can be a string or a buffer. <br />
        /// The encoding argument is ignored if data is a buffer. It defaults to 'utf8'.</summary>
        /// <param name='filename' type='String' />
        /// <param name='options' type='Object' optional='true' />
        /// <param name='listener' value='listener(new Object(),new Object())' />
    };
    this.unwatchFile = function (filename) {
        /// <summary>
        /// top watching for changes on filename. <br />
        /// If listener is specified, only that particular listener is removed.<br /> 
        /// Otherwise, all listeners are removed and you have effectively stopped watching filename.
        /// </summary>
        /// <param name='filename' type='String' />
    };
    this.watch = function (filename, options, listener) {
        /// <summary>
        /// Watch for changes on filename, where filename is either a file or a directory. The returned object is a fs.FSWatcher.
        /// </summary>
        /// <param name='filename' type='String'>
        /// The options if provided should be an object containing a boolean member persistent,<br /> 
        /// which indicates whether the process should continue to run as long as files are being watched. <br />
        /// The default is { persistent: true }.
        /// </param>
        /// <param name='options' type='Object' optional='true' />
        /// <param name='listener' value='listener(new Object(),new Object())' optional='true'>
        /// The listener callback gets two arguments (event, filename). event is either 'rename' or 'change', and filename is the name of the file which triggered the event.
        /// </param>
        /// <returns type='Fs.FSWatcher' ></returns>
        return new require.modules.fs.FSWatcher();
    };
    this.exists = function (path, callback) {
        /// <summary>Test whether or not the given path exists by checking with the file system. </summary>
        /// <param name='path' type='String' />
        /// <param name='callback' value='callback(new Boolean())' optional='true' >
        /// Then call the callback argument with either true or false.
        /// </param>
    };
    this.existsSync = function (path) {
        /// <summary>Test whether or not the given path exists by checking with the file system. </summary>
        /// <param name='path' type='String' />
        /// <returns type='Boolean' ></returns>
        return new Boolean();
    };
    this.createReadStream = function (path, options) {
        /// <summary>Returns a new ReadStream object.</summary>
        /// <param name='path' type='String'>File path.</param>
        /// <param name='options' type='Object' optional='true'>
        /// Options can include start and end values to read a range of bytes from the file instead of the entire file. <br />
        /// Both start and end are inclusive and start at 0. The encoding can be 'utf8', 'ascii', or 'base64'.<br />
        /// bufferSize sets up the number of bytes read at a time. Default buffer size is 64KB.
        /// </param>
        /// <returns type='Fs.ReadStream' >New ReadStream object</returns>
        return new require.modules.fs.ReadStream();
    };
    this.createWriteStream = function (path, options) {
        /// <summary>Returns a new WriteStream object.</summary>
        /// <param name='path' type='String'>File path.</param>
        /// <param name='options' type='Object' optional='true'>
        /// Options may also include a start option to allow writing data at some position past the beginning of the file. <br />
        /// Modifying a file rather than replacing it may require a flags mode of r+ rather than the default mode w.<br />
        /// The encoding can be 'utf8', 'ascii', or 'base64'.
        /// The mode can set file permission mode.
        /// </param>
        /// <returns type='Fs.WriteStream' >New WriteStream object</returns>
        return new require.modules.fs.WriteStream();
    };
}

require.modules.fs.Stats = function () {
    /// <summary>Objects returned from fs.stat(), fs.lstat() and fs.fstat() and their synchronous counterparts are of this type.</summary>
    this.isFile = function () {
        /// <returns type='Boolean' ></returns>
        return new Boolean();
    };
    this.isDirectory = function () {
        /// <returns type='Boolean' ></returns>
        return new Boolean();
    };
    this.isBlockDevice = function () {
        /// <returns type='Boolean' ></returns>
        return new Boolean();
    };
    this.isCharacterDevice = function () {
        /// <returns type='Boolean' ></returns>
        return new Boolean();
    };
    this.isSymbolicLink = function () {
        /// <returns type='Boolean' ></returns>
        return new Boolean();
    };
    this.isFIFO = function () {
        /// <returns type='Boolean' ></returns>
        return new Boolean();
    };
    this.isSocket = function () {
        /// <returns type='Boolean' ></returns>
        return new Boolean();
    };
}

require.modules.fs.ReadStream = function () {
    /// <summary>ReadStream is a Readable Stream.</summary>
    /// <returns type='Stream' ></returns>
    return new Stream();
}

require.modules.fs.WriteStream = function () {
    /// <summary>WriteStream is a Writable Stream.</summary>
    /// <returns type='Stream' ></returns>
    return new Stream();
}

require.modules.fs.FSWatcher = function () {
    this.close = function () {
        /// <summary>Stop watching for changes on the given fs.FSWatcher.</summary>
    };
}
