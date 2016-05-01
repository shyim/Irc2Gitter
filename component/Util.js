"use strict";

class Util {
    getIrcConfig(serverConfig) {
        if (typeof serverConfig.ircConfig == 'undefined') {
            serverConfig.ircConfig = {};
        }

        serverConfig.ircConfig.channels = this.getIrcChannels(serverConfig);

        return serverConfig.ircConfig;
    }
    getIrcChannels(serverConfig) {
        var channels = [];
        serverConfig.channels.forEach((item) => {
            channels.push(item.ircChannel);
        });

        return channels;
    }
}

module.exports = new Util;