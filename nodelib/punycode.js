require.modules.punycode = new function () {
    /// <summary>
    /// Punycode.js is bundled with Node.js v0.6.2+. Use require('punycode') <br />
    /// to access it. (To use it with other Node.js versions, use npm to install <br />
    /// the punycode module first.)
    /// </summary>
    /// <field name="ucs2" type="PunyCode.Ucs2">Ucs2 conversion object.</field>
    /// <field name="version" type="Number">A string representing the current Punycode.js version number.</field>

    this.decode = function(string) {
        /// <summary>
        /// Converts a Punycode string of ASCII code points to a string of Unicode code points.
        /// </summary>
        /// <param name="string" type="String"></param>
    };

    this.encode = function(string) {
        /// <summary>
        /// Converts a string of Unicode code points to a Punycode string of ASCII code points.
        /// </summary>
        /// <param name="string" type="String"></param>
    };

    this.toUnicode = function (domain) {
        /// <summary>
        /// Converts a Unicode string representing a domain name to Punycode. <br />
        /// Only the non-ASCII parts of the domain name will be converted, i.e. <br />
        /// it doesn't matter if you call it with a domain that's already in ASCII. 
        /// </summary>
        /// <param name="string" type="String">Domain name</param>
    };

    this.toASCII = function(dimain) {
        /// <summary>
        /// Converts a Unicode string representing a domain name to Punycode. <br />
        /// Only the non-ASCII parts of the domain name will be converted, i.e. <br />
        /// it doesn't matter if you call it with a domain that's already in ASCII.
        /// </summary>
        /// <param name="dimain"></param>
    };

    this.ucs2 = {
        decode: function(string) {
            /// <summary>
            /// Creates an array containing the decimal code points of each Unicode <br />
            /// character in the string. While JavaScript uses UCS-2 internally, <br />
            /// this function will convert a pair of surrogate halves (each of <br />
            /// which UCS-2 exposes as separate characters) into a single code point, <br />
            /// matching UTF-16.
            /// </summary>
            /// <param name="string"></param>
        },
        encode : function(codePoint) {
            /// <summary>
            /// Creates a string based on an array of decimal code points.
            /// </summary>
            /// <param name="codePoint" type="Object"></param>
        }
    };

    this.version = new Number();
};
