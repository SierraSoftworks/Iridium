require.modules.crypto.dns = new function () {
    /// <summary>
    /// Use require('dns') to access this module. All methods in the dns module<br />
    /// use C-Ares except for dns.lookup which uses getaddrinfo in a thread pool. <br />
    /// C-Ares is much faster than getaddrinfo but the system resolver is more <br />
    /// constant with how other programs operate. When a user does <br />
    /// net.connect(80, 'google.com') or http.get({ host: 'google.com' }) the <br />
    /// dns.lookup method is used. Users who need to do a large number of look <br />
    /// ups quickly should use the methods that go through C-Ares.
    /// </summary>


    this.lookup = function (domain, family, callback) {
        /// <summary>
        /// Resolves a domain (e.g. 'google.com') into the first found A (IPv4) <br />
        /// or AAAA (IPv6) record. The family can be the integer 4 or 6. <br />
        /// Defaults to null that indicates both Ip v4 and v6 address family.
        /// </summary>
        /// <param name='domain' type='String' />
        /// <param name='family' type='Number' optional='true' />
        /// <param name='callback' value='callback(new Error(),new String(),new Number())' />
    };
    this.resolve = function (domain, rrtype, callback) {
        /// <summary>
        /// Resolves a domain (e.g. 'google.com') into an array of the record <br />
        /// types specified by rrtype. Valid rrtypes are 'A' (IPV4 addresses, <br />
        /// default), 'AAAA' (IPV6 addresses), 'MX' (mail exchange records), <br />
        /// 'TXT' (text records), 'SRV' (SRV records), 'PTR' (used for reverse <br />
        /// IP lookups), 'NS' (name server records) and 'CNAME' (canonical name records).
        /// </summary>
        /// <param name='domain' type='String' />
        /// <param name='rrtype' type='String' optional='true' />
        /// <param name='callback' value='callback(new Error(),new Array())' />
    };
    this.resolve4 = function (domain, callback) {
        /// <summary>
        /// The same as dns.resolve(), but only for IPv4 queries (A records). <br />
        /// addresses is an array of IPv4 addresses (e.g. ['74.125.79.104', <br />
        /// '74.125.79.105', '74.125.79.106']).
        /// </summary>
        /// <param name='domain' type='String' />
        /// <param name='callback' value='callback(new Error(),new Array())' />
    };
    this.resolve6 = function (domain, callback) {
        /// <summary>
        /// The same as dns.resolve4() except for IPv6 queries (an AAAA query).
        /// </summary>
        /// <param name='domain' type='String' />
        /// <param name='callback' value='callback(new Error(),new Array())' />
    };
    this.resolveMx = function (domain, callback) {
        /// <summary>
        /// The same as dns.resolve(), but only for mail exchange queries (MX records).
        /// </summary>
        /// <param name='domain' type='String' />
        /// <param name='callback' value='callback(new Error(),new Array())' />
    };
    this.resolveTxt = function (domain, callback) {
        /// <summary>
        /// The same as dns.resolve(), but only for service records (SRV <br />
        /// records). addresses is an array of the SRV records available for <br />
        /// domain. Properties of SRV records are priority, weight, port, and name
        /// </summary>
        /// <param name='domain' type='String' />
        /// <param name='callback' value='callback(new Error(),new Array())' />
    };
    this.resolveSrv = function (domain, callback) {
        /// <summary>
        /// The same as dns.resolve(), but only for service records (SRV <br />
        /// records). addresses is an array of the SRV records available for <br />
        /// domain. Properties of SRV records are priority, weight, port, and name
        /// </summary>
        /// <param name='domain' type='String' />
        /// <param name='callback' value='callback(new Error(),new Array())' />
    };
    this.resolveNs = function (domain, callback) {
        /// <summary>
        /// The same as dns.resolve(), but only for name server records (NS <br />
        /// records). addresses is an array of the name server records available <br />
        /// for domain
        /// </summary>
        /// <param name='domain' type='String' />
        /// <param name='callback' value='callback(new Error(),new Array())' />
    };
    this.resolveCname = function (domain, callback) {
        /// <summary>
        /// The same as dns.resolve(), but only for name server records (NS <br />
        /// records). addresses is an array of the name server records available <br />
        /// for domain
        /// </summary>
        /// <param name='domain' type='String' />
        /// <param name='callback' value='callback(new Error(),new Array())' />
    };
    this.reverse = function (ip, callback) {
        /// <summary>
        /// Reverse resolves an ip address to an array of domain names.
        /// </summary>
        /// <param name='ip' type='String' />
        /// <param name='callback' value='callback(new Error(),new String())' />
    };
    // Error Codes
    ////dns.NODATA;
    ////dns.FORMERR;
    ////dns.SERVFAIL;
    ////dns.NOTFOUND;
    ////dns.NOTIMP;
    ////dns.REFUSED;
    ////dns.BADQUERY;
    ////dns.BADNAME;
    ////dns.BADFAMILY;
    ////dns.BADRESP;
    ////dns.CONNREFUSED;
    ////dns.TIMEOUT;
    ////dns.EOF;
    ////dns.FILE;
    ////dns.NOMEM;
    ////dns.DESTRUCTION;
    ////dns.BADSTR;
    ////dns.BADFLAGS;
    ////dns.NONAME;
    ////dns.BADHINTS;
    ////dns.NOTINITIALIZED;
    ////dns.LOADIPHLPAPI;
    ////dns.ADDRGETNETWORKPARAMS;
    ////dns.CANCELLED;
};
