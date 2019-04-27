"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
function BuildUrl(config) {
    let url = "mongodb://";
    if (config.username) {
        url += encodeURIComponent(config.username);
        if (config.password)
            url += ":" + encodeURIComponent(config.password);
        url += "@";
    }
    url += buildHostList(config);
    if (config.database)
        url += "/" + encodeURIComponent(config.database);
    return url;
}
exports.BuildUrl = BuildUrl;
function buildHostList(config) {
    let hosts = [];
    if (config.host) {
        if (config.port)
            hosts.push(`${encodeURIComponent(config.host)}:${config.port}`);
        else
            hosts.push(encodeURIComponent(config.host));
    }
    if (config.hosts) {
        config.hosts.forEach(host => {
            if (host.port)
                hosts.push(`${encodeURIComponent(host.address)}:${host.port}`);
            else if (config && config.port)
                hosts.push(`${(host.address)}:${config.port}`);
            else
                hosts.push((host.address));
        });
    }
    if (hosts.length)
        return lodash_1.uniq(hosts).join(",");
    else
        return "localhost";
}
//# sourceMappingURL=UrlBuilder.js.map