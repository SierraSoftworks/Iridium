var Buffer = function (args) {
    /// <summary>
    /// Allocates a new buffer, using subject as a size of octets or using it as an array of octets.
    /// </summary>
    /// <param name="subject">Number, array, or string.</param>
    /// <param name="encoding" optional="true" default="'utf-8'"></param>
    /// <param name="offset" optional="true" default="0"></param>
    /// <field name="length">
    /// The size of the buffer in bytes.  
    /// Note that this is not necessarily the size of the contents. 
    /// length refers to the amount of memory allocated for the buffer object.  
    /// It does not change when the contents of the buffer are changed.
    /// </field>
    /// <field name="INSPECT_MAX_BYTES">
    /// How many bytes will be returned when buffer.inspect() is called. This can be overriden by user modules.
    /// </field>

    var buf = new Array();
    buf.write = function (string, offset, length, encoding) {
        /// <summary>
        /// Writes string to the buffer at offset using the given encoding. 
        /// length is the number of bytes to write. Returns number of octets written. 
        /// If buffer did not contain enough space to fit the entire string, it will write a partial amount of the string. 
        /// The method will not write partial characters.
        /// </summary>
        /// <param name="string" type="String">String data.</param>
        /// <param name="offset" type="Integer" optional="true" default="0">Offset number.</param>
        /// <param name="length" type="Integer" optional="true" default="buffer.length-offset">Length of data to writing buffers.</param>
        /// <param name="encoding" type="String" optional="true" default="'utf8'">Encoding option</param>
    };
    buf.copy = function (targetBuffer, targetStart, sourceStart, sourceEnd) {
        /// <summary>
        /// Does copy between buffers. The source and target regions can be overlapped.
        /// </summary>
        /// <param name="targetBuffer"></param>
        /// <param name="targetStart" type="Integer" optional="true" default="0"></param>
        /// <param name="sourceStart" type="Integer" optional="true" default="0"></param>
        /// <param name="sourceEnd" type="Integer" optional="true" default="buffer.length"></param>
    };

    buf.toString = function(encoding, start, end) {
        /// <summary>
        /// Decodes and returns a string from buffer data encoded with encoding beginning at start and ending at end.
        /// </summary>
        /// <param name="encoding" type="String"></param>
        /// <param name="start" type="Integer" optional="true" default="0"></param>
        /// <param name="end" type="Integer" optional="true" default="buffer.length"></param>
    };
    buf.slice = function(start, end) {
        /// <summary>
        /// Returns a new buffer which references the same memory as the old, but offset and cropped by the start and end indexes. 
        /// Modifying the new buffer slice will modify memory in the original buffer!
        /// </summary>
        /// <param name="start" type="Integer"></param>
        /// <param name="end"  type="Integer" optional="true" default="buffer.length"></param>
    };

    buf.readUInt8 = function (offset, noAssert) {
        /// <summary>
        /// Reads an unsigned 8 bit integer from the buffer at the specified offset.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that offset may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readUInt16LE = function (offset, noAssert) {
        /// <summary>
        /// Reads an unsigned 16 bit integer from the buffer at the specified offset with little endian format.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that offset may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readUInt16BE = function (offset, noAssert) {
        ///<summary>
        /// Reads an unsigned 16 bit integer from the buffer at the specified offset with big endian format.
        /// </summary>
        ///<param name="offset" type="Integer"></param>
        ///<param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that offset may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readUInt32LE = function (offset, noAssert) {
        /// <summary>
        /// Reads an unsigned 32 bit integer from the buffer at the specified offset with little endian format.
        /// </summary>
        /// <param name='offset' type='Number' />
        /// <param name='noAssert' type='Boolean' optional='true'/>
        /// <returns type='Number' />
        return new Number();
    };
    buf.readUInt32BE = function (offset, noAssert) {
        /// <summary>
        /// Reads an unsigned 32 bit integer from the buffer at the specified offset with big endian format.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">Set `noAssert` to true to skip validation of `offset`. This means that `offset` may be beyond the end of the buffer.</param>
        return new Number();
    };
    buf.readInt8 = function (offset, noAssert) {
        /// <summary>
        /// Reads a signed 8 bit integer from the buffer at the specified offset. 
        /// Works as buffer.readUInt8, except buffer contents are treated as two's complement signed values.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that `offset` may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readInt16LE = function (offset, noAssert) {
        /// <summary>
        /// Reads a signed 16 bit integer from the buffer at the specified offset with little endian format. 
        /// Works as buffer.readUInt16*, except buffer contents are treated as two's complement signed values.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that `offset` may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readInt16BE = function (offset, noAssert) {
        /// <summary>
        /// Reads a signed 16 bit integer from the buffer at the specified offset with big endian format. 
        /// Works as `buffer.readUInt16*`, except buffer contents are treated as two's complement signed values.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that offset may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readInt32LE = function (offset, noAssert) {
        /// <summary>
        /// Reads a signed 32 bit integer from the buffer at the specified offset with little endian format. 
        /// Works as buffer.readUInt32*, except buffer contents are treated as two's complement signed values.
        /// </summary>
        /// <param name="offset"></param>
        /// <param name="noAssert" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that offset may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readInt32BE = function (offset, noAssert) {
        /// <summary>
        /// Reads a signed 32 bit integer from the buffer at the specified offset with big endian format. 
        /// Works as buffer.readUInt32*, except buffer contents are treated as two's complement signed values.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that offset may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readFloatLE = function (offset, noAssert) {
        ///<summary>
        /// Reads a 32 bit float from the buffer at the specified offset with little endian format.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that `offset` may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readFloatBE = function (offset, noAssert) {
        /// <summary>
        /// Reads a 64 bit double from the buffer at the specified offset with little endian format.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that `offset` may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readDoubleLE = function (offset, noAssert) {
        /// <summary>
        /// Reads a 64 bit double from the buffer at the specified offset with little endian format.
        /// </summary>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that `offset` may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.readDoubleBE = function (offset, noAssert) {
        /// <summary>
        /// Reads a 64 bit double from the buffer at the specified offset with big endian format.
        /// </summary>
        /// <param name="offset" type="Double"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of offset. 
        /// This means that `offset` may be beyond the end of the buffer.
        /// </param>
        return new Number();
    };
    buf.writeUInt8 = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset. 
        /// Note, value must be a valid unsigned 8 bit integer.
        /// </summary>
        /// <param name="value" type="Integer"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function 
        /// and offset may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeUInt16LE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with little endian format. 
        /// Note, value must be a valid unsigned 16 bit integer.
        /// </summary>
        /// <param name="value" type="Integer"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function 
        /// and offset may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeUInt16BE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with big endian format. 
        /// Note, value must be a valid unsigned 16 bit integer.
        /// </summary>
        /// <param name="value" type="Integer"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function and offset may be beyond 
        /// the end of the buffer leading to the values being silently dropped. This should not be used 
        /// unless you are certain of correctness.
        /// </param>
    };
    buf.writeUInt32LE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with little endian format. 
        /// Note, value must be a valid unsigned 32 bit integer.
        /// </summary>
        /// <param name="value" type="Integer"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that `value` may be too large for the specific function and offset 
        /// may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeUInt32BE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with big endian format. 
        /// Note, value must be a valid unsigned 32 bit integer.
        /// </summary>
        /// <param name="value"></param>
        /// <param name="offset"></param>
        /// <param name="noAssert" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function and offset 
        /// may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeInt8 = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset. 
        /// Note, value must be a valid signed 8 bit integer. 
        /// Works as buffer.writeUInt8, except value is written out as a two's complement signed integer into buffer.
        /// </summary>
        /// <param name="value" type="Integer"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that `value` may be too large for the specific function and offset
        ///  may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeInt16LE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with little endian format. 
        /// Note, value must be a valid signed 16 bit integer. 
        /// Works as buffer.writeUInt16*, except value is written out as a two's complement signed integer into buffer.
        /// </summary>
        /// <param name="value" type="Integer"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function 
        /// and offset may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeInt16BE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with big endian format. 
        /// Note, value must be a valid signed 16 bit integer. 
        /// Works as buffer.writeUInt16*, except value is written out as a two's complement signed integer into buffe.
        /// </summary>
        /// <param name="value" type="Integer"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function and offset
        ///  may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeInt32LE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with little endian format. 
        /// Note, value must be a valid signed 32 bit integer. Works as buffer.writeUInt32*, 
        /// except value is written out as a two's complement signed integer into buffer.
        /// </summary>
        /// <param name="value" type="Integer32"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function and offset 
        /// may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeInt32BE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with big endian format. 
        /// Note, value must be a valid signed 32 bit integer. 
        /// Works as buffer.writeUInt32*, except value is written out as a two's complement signed integer into buffer.
        /// </summary>
        /// <param name="value" type="Integer"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function 
        /// and offset may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeFloatLE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with little endian format. 
        /// Note, value must be a valid 32 bit float.
        /// </summary>
        /// <param name="value" type="Float"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function 
        /// and offset may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeFloatBE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with big endian format. 
        /// Note, value must be a valid 32 bit float.
        /// </summary>
        /// <param name="value" type="Float"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function and offset may be beyond 
        /// the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeDoubleLE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with little endian format. 
        /// Note, value must be a valid 64 bit double.
        /// </summary>
        /// <param name="value" type="Double"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function 
        /// and offset may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.writeDoubleBE = function (value, offset, noAssert) {
        /// <summary>
        /// Writes value to the buffer at the specified offset with big endian format. 
        /// Note, value must be a valid 64 bit double.
        /// </summary>
        /// <param name="value" type="Double"></param>
        /// <param name="offset" type="Integer"></param>
        /// <param name="noAssert" type="Boolean" optional="true" default="false">
        /// Set noAssert to true to skip validation of value and offset. 
        /// This means that value may be too large for the specific function 
        /// and offset may be beyond the end of the buffer leading to the values being silently dropped. 
        /// This should not be used unless you are certain of correctness.
        /// </param>
    };
    buf.fill = function (value, offset, end) {
        /// <summary>
        /// Fills the buffer with the specified value. 
        /// If the offset and length are not given it will fill the entire buffer.
        /// </summary>
        /// <param name="value" type="Object"></param>
        /// <param name="offset" type="Integer" optional="true" default="0"></param>
        /// <param name="length" type="Integer" optional="true" default="-1"></param>
    };
    return buf;
};
Buffer.isBuffer = function (obj) {
    /// <summary>Tests if `obj` is a `Buffer`.</summary>
    /// <param name="obj" type="Object"></param>
    /// <returns type="Boolean"></returns>
    return new Boolean();
};
Buffer.byteLength = function (string, encoding) {
    /// <summary>
    /// Gives the actual byte length of a string.  
    /// This is not the same as String.prototype.length since that returns the number of *characters* in a string.
    /// </summary>
    /// <param name="string" type="String"></param>
    /// <param name="encoding"  type="String" optional="true" default="'utf8'"></param>
    /// <returns type="Integer"></returns>
    return new Number();
};
var INSPECT_MAX_BYTES = new Number(50);
