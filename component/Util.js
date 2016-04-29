"use strict";

class Util {
    getIrcConfig(serverConfig) {
        if (typeof serverConfig.ircConfig == 'undefined') {
            serverConfig.ircConfig = {};
        }

        serverConfig.ircConfig.channels = this.getIrcChannels(serverConfig);
    }
    getIrcChannels(serverConfig) {
        var channels = [];
        serverConfig.channels.forEach(function(item) {
            channels.push(item.ircChannel);
        });

        return channels;
    }
}

module.exports = Util;