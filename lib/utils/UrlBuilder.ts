import {Configuration} from "../Configuration";
import {uniq} from "lodash";

export function BuildUrl(config: Configuration): string {
    let url: string = "mongodb://";

    if (config.username) {
        url += config.username;
        if (config.password)
            url += ":" + config.password;
        url += "@";
    }

    url += buildHostList(config);
    
    if (config.database)
        url += "/" + config.database;

    return url;
}

function buildHostList(config: Configuration): string {
    let hosts: string[] = [];

    if (config.host) {
        if (config.port)
            hosts.push(`${config.host}:${config.port}`);
        else
            hosts.push(config.host);
    }

    if (config.hosts) {
        config.hosts.forEach(host => {
            if (host.port)
                hosts.push(`${host.address}:${host.port}`);
            else if(config && config.port)
                hosts.push(`${host.address}:${config.port}`);
            else
                hosts.push(host.address);
        });
    }

    if (hosts.length)
        return uniq(hosts).join(",");
    else
        return "localhost";
}