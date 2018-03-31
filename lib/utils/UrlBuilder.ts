import {Configuration} from "../Configuration";
import {uniq} from "lodash";

export function BuildUrl(config: Configuration): string {
    let url: string = "mongodb://";

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

function buildHostList(config: Configuration): string {
    let hosts: string[] = [];

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
            else if(config && config.port)
                hosts.push(`${(host.address)}:${config.port}`);
            else
                hosts.push((host.address));
        });
    }

    if (hosts.length)
        return uniq(hosts).join(",");
    else
        return "localhost";
}