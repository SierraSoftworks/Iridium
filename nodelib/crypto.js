/// <reference path="buffer.js"/>

require.modules.crypto =new function () {
    /// <summary>
    /// The crypto module requires OpenSSL to be available on the underlying platform. <br />
    /// It offers a way of encapsulating secure credentials to be used as part of a secure HTTPS net or http connection. <br />
    /// It also offers a set of wrappers for OpenSSL's hash, hmac, cipher, decipher, sign and verify methods.<br />
    /// </summary>
    this.createCredentials = function (details) {
        /// <summary>
        /// Creates a credentials object, with the optional details being a dictionary with keys.
        /// </summary>
        /// <param name="details">
        /// key (a string holding the PEM encoded private key), `cert` (a string holding the PEM encoded certificate), <br />
        /// and `ca` (either a string or list of strings of PEM encoded CA certificates to trust)
        /// </param>
        /// <returns type='Credentials' />
        return new require.modules.crypto.Credentials();
    };
    this.createHash = function (algorithm) {
        /// <summary>
        /// Creates and returns a hash object, a cryptographic hash with the given algorithm which can be used to generate hash digests.
        /// </summary>
        /// <param name="algorithm">
        /// `algorithm` is dependent on the available algorithms supported by the version of OpenSSL on the platform. <br />
        /// Examples are 'sha1', 'md5', 'sha256', 'sha512', etc. On recent releases, <br />
        /// `openssl list-message-digest-algorithms` will display the available digest algorithms.
        /// </param>
        /// <returns type='Hash' />
        return new require.modules.crypto.Hash();
    };
    this.createHmac = function (algorithm, key) {
        /// <summary>
        /// Creates and returns a hmac object, a cryptographic hmac with the given algorithm and key.
        /// </summary>
        ///<param name="algorithm">`algorithm` is dependent on the available algorithms supported by OpenSSL.</param>
        ///<param name="key">`key` is the hmac key to be used.</param>
        /// <returns type='Hmac' />
        return new require.modules.crypto.Hmac();
    };
    this.createCipher = function (algorithm, password) {
        /// <summary>Creates and returns a cipher object, with the given algorithm and password.</summary>
        /// <param name="algorithm">
        /// `algorithm` is dependent on OpenSSL, examples are 'aes192', etc. On recent releases, <br />
        /// `openssl list-cipher-algorithms` will display the available cipher algorithms.
        /// </param>
        /// <param name="password">`password` is used to derive key and IV, which must be 'binary' encoded string</param>
        /// <returns type='Cipher' />
        return new require.modules.crypto.Cipher();
    };
    this.createCipheriv = function (algorithm, key, iv) {
        /// <summary>Creates and returns a cipher object, with the given algorithm, key and iv.</summary>
        /// <param name="algorithm">
        /// `algorithm` is dependent on OpenSSL, examples are 'aes192', etc. On recent releases, <br />
        /// `openssl list-cipher-algorithms` will display the available cipher algorithms.
        /// </param>
        /// <param name="key">`key` is a raw key used in algorithm. Must be `binary' encoded string.</param>
        /// <param name="iv">`iv` is an initialization vector. Must be `binary' encoded string.</param>
        /// <returns type='Cipher' />
        return new require.modules.crypto.Cipher();
    };
    this.createDecipher = function (algorithm, password) {
        /// <summary>Creates and returns a decipher object, with the given algorithm and password.</summary>
        /// <param name="algorithm">
        /// `algorithm` is dependent on OpenSSL, examples are 'aes192', etc. On recent releases, <br />
        /// `openssl list-cipher-algorithms` will display the available cipher algorithms.
        /// </param>
        /// <param name="password">`password` is used to derive key and IV, which must be 'binary' encoded string</param>
        /// <returns type='Decipher' />
        return new require.modules.crypto.Decipher();
    };
    this.createDecipheriv = function (algorithm, key, iv) {
        /// <summary>Creates and returns a decipher object, with the given algorithm, key and iv.</summary>
        /// <param name="algorithm">
        /// `algorithm` is dependent on OpenSSL, examples are 'aes192', etc. <br />
        /// On recent releases, `openssl list-cipher-algorithms` will display the available cipher algorithms.
        /// </param>
        ///<param name="key">`key` is a raw key used in algorithm. Must be `binary' encoded string.</param>
        ///<param name="iv">`iv` is an initialization vector. Must be `binary' encoded string.</param>
        /// <returns type='Decipher' />
        return new require.modules.crypto.Decipher();
    };
    this.createSign = function (algorithm) {
        /// <summary>
        /// Creates and returns a signing object, with the given algorithm.<br />
        /// On recent OpenSSL releases, `openssl list-public-key-algorithms` will display the available signing algorithms. <br />
        /// Examples are `'RSA-SHA256'`.
        /// </summary>
        /// <param name='algorithm' type='String' />
        /// <returns type='Signer' />
        return new require.modules.crypto.Signer();
    };
    this.createVerify = function(algorithm) {
        /// <summary>
        /// Creates and returns a verification object, with the given algorithm. This is the mirror of the signing object.
        /// </summary>
        /// <param name='algorithm' type='String' />
        /// <returns type='Verify' />
        return new require.modules.crypto.Verify();
    };
    this.createDiffieHellman = function (prime, encoding) {
        /// <summary>
        /// Creates a Diffie-Hellman key exchange object and generates a prime of the given bit length. The generator used is `2`.
        /// </summary>
        /// <param name='prime' type='String' />
        /// <param name='encoding' type='String' optional='true' />
        /// <returns type='DiffieHellman' />
        return new require.modules.crypto.DiffieHellman();
    };
    this.getDiffieHellman = function (group_name) {
        
        /// <param name='group_name' type='String' />
        /// <returns type='DiffieHellman' />
        return new require.modules.crypto.DiffieHellman();
    };
    this.pbkdf2 = function (password, salt, iterations, keylen, callback) {
        /// <summary>
        /// Asynchronous PBKDF2 applies pseudorandom function HMAC-SHA1 to derive a key of given length from the given password, 
        /// salt and iterations. The callback gets two arguments `(err, derivedKey)`.
        /// </summary>
        /// <param name='password' type='String' />
        /// <param name='salt' type='Number' />
        /// <param name='iterations' type='Number' />
        /// <param name='keylen' type='Number' />
        /// <param name='callback' value='callback(new Error(),new Object())' />
        /// <returns type='Object' />
    };
    this.randomBytes = function (size, callback) {
        /// <summary>Generates cryptographically strong pseudo-random data.</summary>
        /// <param name='keylen' type='String' />
        /// <param name='callback' value='callback(new Error(),new Buffer())' optional='true' />
        /// <returns type='Buffer' />
        return new Buffer();
    };
};

require.modules.crypto.Credentials = function () { }

require.modules.crypto.Hash = function () {
    /// <summary>
    /// A hash object, a cryptographic hash with the given algorithm which can be used to generate hash digests.
    /// </summary>
    this.update = function (data, input_encoding) {
        /// <summary>
        /// Updates the hash content with the given data. This can be called many times with new data as it is streamed.
        /// </summary>
        /// <param name='data' type='String' />
        /// <param name='input_encoding' type='String' optional='true' />
    };
    this.digest = function (encoding) {
        /// <summary>
        /// Calculates the digest of all of the passed data to be hashed. 
        /// The encoding can be 'hex', 'binary' or 'base64'.
        /// </summary>
        /// <param name='encoding' type='String' optional='true'>
        /// The encoding can be 'hex', 'binary' or 'base64'.\
        /// </param>
        /// <returns type='String' />
        return new String();
    };
};

require.modules.crypto.Hmac = function () {
    /// <summary>
    /// An hmac object, a cryptographic hmac with the given algorithm and key.
    /// </summary>
    this.update = function (data) {
        /// <summary>
        /// Update the hmac content with the given data. <br />
        /// This can be called many times with new data as it is streamed.
        /// </summary>
        /// <param name='data' type='String' />
    };
    this.digest = function (encoding) {
        /// <summary>
        /// Calculates the digest of all of the passed data to the hmac. 
        /// The encoding can be 'hex', 'binary' or 'base64'.
        /// </summary>
        /// <param name="encoding" optional="true" default="'binary'">
        /// The encoding can be 'hex', 'binary' or 'base64'.
        /// </param>
        /// <returns type='String' />
        return new String();
    };
};

require.modules.crypto.Cipher = function () {
    /// <summary>A cipher object</summary>
    this.update = function (data, input_encoding, output_encoding) {
        /// <summary>
        /// Updates the cipher with data, the encoding of <br />
        /// which is given in input_encoding and can be 'utf8', 'ascii' or 'binary'. <br />
        /// The output_encoding specifies the output format of the enciphered data, <br />
        /// and can be 'binary', 'base64' or 'hex'. <br />
        /// Returns the enciphered contents, and can be called many times with new data as it is streamed.<br />
        /// </summary>
        /// <param name="data"></param>
        /// <param name="input_encoding" optional="true" default="'binary'">
        /// 'utf8', 'ascii' or 'binary'
        /// </param>
        /// <param name="output_encoding" optional="true" default="'binary'">
        /// 'binary', 'base64' or 'hex'
        /// </param>
    };
    this.final = function (output_encoding) {
        /// <summary>
        /// Returns any remaining enciphered contents, with output_encoding being one of: 'binary', 'base64' or 'hex'.
        /// </summary>
        /// <param name="output_encoding" optional="true" default="'binary'">'binary', 'base64' or 'hex'</param>
        return new String();
    };
    this.setAutoPadding = function (auto_padding) {
        /// <param name='auto_padding' type='Boolean' />
    };
};

require.modules.crypto.Decipher = function () {
    /// <summary>A decipher object</summary>
    this.update = function (data, input_encoding, output_encoding) {
        /// <summary>
        /// Updates the decipher with data, which is encoded in 'binary', 'base64' or 'hex'. <br />
        /// The `output_decoding` specifies in what format to return the deciphered plaintext: 'binary', 'ascii' or 'utf8'.
        /// </summary>
        /// <param name="data"></param>
        /// <param name="input_encoding" optional="true" default="'binary'">
        /// 'utf8', 'ascii' or 'binary'
        /// </param>
        /// <param name="output_encoding" optional="true" default="'binary'">
        /// 'binary', 'base64' or 'hex'
        /// </param>
    };
    this.final = function (output_encoding) {
        /// <summary>
        /// Returns any remaining plaintext which is deciphered, with output_encoding<br />
        ///  being one of: 'binary', 'ascii' or 'utf8'.
        /// </summary>
        /// <param name="output_encoding" optional="true" default="'binary'">
        /// 'binary', 'ascii' or 'utf8'
        /// </param>
        return new String();
    };
    this.setAutoPadding = function (auto_padding) {
        /// <param name='auto_padding' type='Boolean' />
    };
};

require.modules.crypto.Signer = function () {
    /// <summary>A signing object.</summary>
    this.update = function (data) {
        /// <summary>
        /// Updates the signer object with data. <br />
        /// This can be called many times with new data as it is streamed.<br />
        /// </summary>
        /// <param name="data"></param>
    };
    this.sign = function (private_key, output_format) {
        /// <summary>
        /// Calculates the signature on all the updated data passed through the signer. <br />
        /// private_key is a string containing the PEM encoded private key for signing.<br />
        /// </summary>
        /// <param name="private_key"></param>
        /// <param name="output_format" optional="true" default="'binary'"></param>
        return new String();
    };
};

require.modules.crypto.Verify = function () {
    this.update = function (data) {
        /// <summary>
        /// Updates the verifier object with data. <br />
        /// This can be called many times with new data as it is streamed.
        /// </summary>
        /// <param name="data"></param>
    };
    this.verify = function (object, signature, signature_format) {
        /// <summary>
        /// Verifies the signed data by using the object and signature. <br />
        /// object is  a string containing a PEM encoded object, which can be one of RSA public key, <br />
        /// DSA public key, or X.509 certificate. 
        /// signature is the previously calculated signature for the data, <br />
        /// in the signature_format which can be 'binary', 'hex' or 'base64'.
        /// </summary>
        /// <param name="object"></param>
        /// <param name="signature"></param>
        /// <param name="signature_format" optional="true" default="'binary'">
        /// 'binary', 'hex' or 'base64'
        /// </param>
        /// <returns>
        /// Returns true or false depending on the validity of the signature for the data and public key.
        /// </returns>
        return new Boolean();
    };
};

require.modules.crypto.DiffieHellman = function () {
    /// <summary>A Diffie-Hellman key exchange object.</summary>
    this.generateKeys = function (encoding) {
        /// <summary>
        /// Generates private and public Diffie-Hellman key values, <br />
        /// and returns the public key in the specified encoding. <br />
        /// This key should be transferred to the other party. <br />
        /// Encoding can be 'binary', 'hex', or 'base64'.
        /// </summary>
        /// <param name="encoding" optional="true" default="'binary'">
        /// 'binary', 'hex', or 'base64'
        /// </param>
    };
    this.computeSecret = function (other_public_key, input_encoding, output_encoding) {
        /// <summary>
        /// Computes the shared secret using other_public_key as the other party's public key <br />
        /// and returns the computed shared secret. <br />
        /// Supplied key is interpreted using specified input_encoding, <br />
        /// and secret is encoded using specified output_encoding. <br />
        /// Encodings can be 'binary', 'hex', or 'base64'. <br />
        /// If no output encoding is given, the input encoding is used as output encoding.<br />
        /// </summary>
        /// <param name="other_public_key"></param>
        /// <param name="input_encoding" optional="true" default="'binary'">'binary', 'hex', or 'base64'</param>
        /// <param name="output_encoding" optional="true" default="input_encoding">'binary', 'hex', or 'base64'</param>
        /// <returns type='String' />
        return new String();
    };
    this.getPrime = function (encoding) {
        /// <summary>
        /// Returns the Diffie-Hellman prime in the specified encoding, <br />
        /// which can be 'binary', 'hex', or 'base64'.</summary>
        /// <param name="encoding" optional="true" default="'binary'">
        /// 'binary', 'hex', or 'base64'
        /// </param>
        /// <returns type='String' />
        return new String();
    };
    this.getGenerator = function (encoding) {
        /// <summary>
        /// Returns the Diffie-Hellman prime in the specified encoding, <br />
        /// which can be 'binary', 'hex', or 'base64'.
        /// </summary>
        /// <param name="encoding" optional="true" default="'binary'">
        /// 'binary', 'hex', or 'base64'
        /// </param>
        /// <returns type='String' />
        return new String();
    };
    this.getPublicKey = function (encoding) {
        /// <summary>
        /// Returns the Diffie-Hellman public key in the specified encoding, <br />
        /// which can be 'binary', 'hex', or 'base64'.
        /// </summary>
        /// <param name="encoding" optional="true" default="'binary'">
        /// 'binary', 'hex', or 'base64'
        /// </param>
        /// <returns type='String' />
        return new String();
    };
    this.getPrivateKey = function (encoding) {
        /// <summary>
        /// Returns the Diffie-Hellman private key in the specified encoding, <br />
        /// which can be 'binary', 'hex', or 'base64'.
        /// </summary>
        /// <param name="encoding" optional="true" default="'binary'">
        /// 'binary', 'hex', or 'base64'
        /// </param>
        return new String();
    };
    this.setPublicKey = function (public_key, encoding) {
        /// <summary>
        /// Sets the Diffie-Hellman public key. <br />
        /// Key encoding can be 'binary', 'hex', or 'base64'.<br />
        /// </summary>
        /// <param name="public_key"></param>
        /// <param name="encoding" optional="true" default="'binary'">
        /// 'binary', 'hex', or 'base64'
        /// </param>
        /// <returns type='String' />
        return new String();
    };
    this.setPrivateKey = function (public_key, encoding) {
        /// <summary>
        /// Sets the Diffie-Hellman private key. <br />
        /// Key encoding can be 'binary', 'hex', or 'base64'.
        /// </summary>
        /// <param name="public_key"></param>
        /// <param name="encoding" optional="true" default="'binary'">
        /// 'binary', 'hex', or 'base64'
        /// </param>
        /// <returns type='String' />
        return new String();
    };
};
