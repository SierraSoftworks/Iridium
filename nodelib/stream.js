/// <reference path="events.js" />

require.modules.stream = function () {
    /// <summary>
    /// A stream is an abstract interface implemented by various objects in Node. <br />
    /// For example a request to an HTTP server is a stream, as is stdout. <br />
    /// Streams are readable, writable, or both. All streams are instances of EventEmitter
    /// </summary>
    /// <field name="writable" type="Boolean">
    /// A boolean that is true by default, but turns false after an 'error' occurred or end() / destroy() was called.
    /// </field>
    /// <field name="readable" type="Boolean">
    /// A boolean that is true by default, but turns false after an 'error' occurred, the stream came to an 'end', or destroy() was called.
    /// </field>


    this.writable = new Boolean();
    this.readable = new Boolean();



        
    this.setEncoding = function (encoding) {
        /// <summary>
        /// Makes the 'data' event emit a string instead of a Buffer. 
        /// encoding can be 'utf8', 'utf16le' ('ucs2'), 'ascii', or 'hex'. 
        /// Defaults to 'utf8'.
        /// </summary>
        /// <param name='encoding' type='String' optional='true' />
    };
    this.pause = function () {
        /// <summary>
        /// Issues an advisory signal to the underlying communication layer, 
        /// requesting that no further data be sent until resume() is called.
        /// </summary>
    };
    this.resume = function () {
        /// <summary>
        /// Resumes the incoming 'data' events after a pause().
        /// </summary>
    };
    this.destroy = function () {
        /// <summary>
        /// Closes the underlying file descriptor. Stream is no longer writable nor readable. 
        /// The stream will not emit any more 'data', or 'end' events. Any queued write data will not be sent. 
        /// The stream should emit 'close' event once its resources have been disposed of.
        /// </summary>
    };
    this.pipe = function (destination, options) {
        /// <summary>
        /// This is a Stream.prototype method available on all Streams.<br />
        /// Connects this read stream to destination WriteStream. Incoming data on this stream gets written to destination. 
        /// The destination and source streams are kept in sync by pausing and resuming as necessary.
        /// </summary>
        /// <param name='destination' type='Stream' />
        /// <param name='options' type='Object' optional='true' />
        /// <returns type="Stream">This function returns the destination stream.</returns>
        return new Stream();
    };


    this.write = function (buffer, string, encoding) {
        /// <signature>
        /// <summary>
        /// Same as the above except with a raw buffer.
        /// </summary>
        /// <param name='buffer' type='Buffer'>raw buffer.</param>
        /// </signature>
        /// <signature>
        /// <summary>
        /// Writes string with the given encoding to the stream. <br />
        /// Returns true if the string has been flushed to the kernel buffer. <br />
        /// Returns false to indicate that the kernel buffer is full, and the data will be sent out in the future. <br />
        /// The 'drain' event will indicate when the kernel buffer is empty again. The encoding defaults to 'utf8'.
        /// </summary>
        /// <param name='string' type='String'>text.</param>
        /// <param name='encoding' type='String' optional='true'>text encoding description.</param>
        /// <returns type="Boolean" >
        /// Returns true if the string has been flushed to the kernel buffer. <br />
        /// Returns false to indicate that the kernel buffer is full, and the data will be sent out in the future.
        /// </returns>
        /// </signature>
        return new Boolean();
        
    };
    this.end = function (buffer) {
        /// <signature>
        /// <summary>Terminates the stream with EOF or FIN. <br />
        /// This call will allow queued write data to be sent before closing the stream.
        /// </summary>
        /// </signature>
        /// <signature>
        /// <summary>
        /// Same as above but with a buffer.
        /// </summary>
        /// <param name='buffer' type='Buffer' />
        /// </signature>
        /// <signature>
        /// <summary>
        /// Sends string with the given encoding and terminates the stream with EOF or FIN.<br /> 
        /// This is useful to reduce the number of packets sent.
        /// </summary>
        /// <param name='string' type='String'>text.</param>
        /// <param name='encoding' type='String' optional='true'>text encoding description.</param>
        /// </signature>

    };
    this.destroy = function () {
        /// <summary>
        /// Closes the underlying file descriptor. Stream is no longer writable nor readable. The stream will not emit any more 'data', or 'end' events. Any queued write data will not be sent. <br />
        /// The stream should emit 'close' event once its resources have been disposed of.
        /// </summary>
    };

    this.destroySoon = function () {
        /// <summary>
        /// After the write queue is drained, close the file descriptor. <br />
        /// destroySoon() can still destroy straight away, as long as there is no data left in the queue for writes.
        /// </summary>
    };
};

require.modules.stream.prototype = new require.modules.events.EventEmitter();
