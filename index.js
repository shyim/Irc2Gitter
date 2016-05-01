const IrcClient = require('irc'),
    GitterClient = require('node-gitter'),
    Util = require('./component/Util'),
    MessageParser = require('./component/Message'),
    Config = JSON.parse(require('fs').readFileSync('config.json')),
    Strip = require('strip');

Object.keys(Config).forEach(function (key) {
    var gitter = new GitterClient(Config[key].gitterToken);
    gitter.connectedChannels = {};
    console.log(Util.getIrcConfig(Config[key]));
    var ircClient = new IrcClient.Client(key, Config[key].nickname, Util.getIrcConfig(Config[key]));

    /**
     * Setup Gitter
     */
    Config[key].channels.forEach((item) => {
        gitter.rooms.join(item.gitterChannel, (err, room) => {
            gitter.connectedChannels[item.ircChannel] = room;

            var events = room.streaming().chatMessages();

            events.on('chatMessages', (message) => {
                if (message.operation == 'create') {
                    try {
                        if (message.model.fromUser.username != Config[key].gitterNickname) {
                            MessageParser.parseMessage(message.model.html, (message) => {
                                ircClient.say(item.ircChannel, strip(message));
                            });
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            });
        });
    });

    /**
     * Setup Irc
     */
    ircClient.on('message', (from, to, message) => {
        if (typeof gitter.connectedChannels[to] != 'undefined' && from != Config[key].nickname) {
            gitter.connectedChannels[to].send("**" + from + ":** " + message);
        }
    });

    ircClient.on('join', (channel, nick, message) => {
        if (typeof gitter.connectedChannels[channel] != 'undefined' && nick != ircClient.nick) {
            gitter.connectedChannels[channel].send("**JOIN**: " + nick);
        }
    });

    ircClient.on('part', (channel, nick, message) => {
        if (typeof gitter.connectedChannels[channel] != 'undefined' && nick != ircClient.nick) {
            gitter.connectedChannels[channel].send("**LEAVE**: " + nick);
        }
    });

    ircClient.on('quit', (nick, reason, channels, message) => {
        channels.forEach((channel) => {
            if (typeof gitter.connectedChannels[channel] != 'undefined' && nick != ircClient.nick) {
                gitter.connectedChannels[channel].send("**QUIT**: " + nick);
            }
        });
    });

    ircClient.on('kick', (channel, nick, by, reason) => {
        if (typeof gitter.connectedChannels[channel] != 'undefined' && nick != ircClient.nick) {
            gitter.connectedChannels[channel].send("**KICK**: " + nick.toString() + ' Reason: ' + reason.toString() + ', by: ' + by.toString());
        }
    });

    /**
     * Private Messages
     */
    if (typeof Config[key].gitterPmChannel != 'undefined') {
        var pmChannel;

        gitter.rooms.join(Config[key].gitterPmChannel, (err, room) => {
            pmChannel = room;

            var events = room.streaming().chatMessages();

            events.on('chatMessages', (message) => {
                if (message.operation == 'create') {
                    try {
                        if (message.model.fromUser.username != config[key].gitterNickname) {
                            var splitText = message.model.text.split(':');
                            if (splitText.length > 1) {
                                var messageStr = "";
                                for (var i = 1; i < splitText.length; i++) {
                                    messageStr = messageStr + ":" + splitText[i];
                                }
                                ircClient.say(splitText[0], messageStr);
                            }
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            });
        });

        ircClient.addListener('pm', (from, message) => {
            pmChannel.send("**" + from + ":** " + message);
        });
    }
});
