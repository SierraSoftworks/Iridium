require.modules.string_decoder = {
    StringDecoder: function (encoding) {
        /// <summary>
        /// To use this module, do require('string_decoder'). StringDecoder decodes <br />
        /// a buffer to a string. It is a simple interface to buffer.toString() but <br />
        /// provides additional support for utf8.
        /// </summary>
        /// <param name="encoding"></param>
    }
};

require.modules.string_decoder.StringDecoder.prototype.write = function (buffer) {
    /// <summary>
    /// Returns a decoded string.
    /// </summary>
    /// <param name="buffer"></param>
};