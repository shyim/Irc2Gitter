"use strict";

class Util {
    getIrcChannels(serverConfig) {
        var channels = [];
        serverConfig.channels.forEach(function(item) {
            channels.push(item.ircChannel);
        });

        return channels;
    }
}

module.exports = Util;