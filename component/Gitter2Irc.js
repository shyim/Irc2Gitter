"use strict";

const IrcClient = require('irc'),
    GitterClient = require('node-gitter'),
    Util = require('./Util'),
    MessageParser = require('./Message'),
    Strip = require('strip'),
    Entities = require('html-entities').XmlEntities,
    entities = new Entities(),
    request = require('request');

class Gitter2Irc {
    constructor(host, ircConfig) {
        this.ircConfig = ircConfig;
        this.ircNick = ircConfig.nickname;
        this.gitter = new GitterClient(ircConfig.gitterToken);
        this.connectedChannels = {};
        this.ircClient = new IrcClient.Client(host, ircConfig.nickname, Util.getIrcConfig(ircConfig));

        this.initGitter();
        this.initIrcEvents();

        if (typeof ircConfig.gitterPmChannel != 'undefined') {
            this.initPmChannel();
        }
    }

    initGitter() {
        this.ircConfig.channels.forEach((item) => {
            this.gitter.rooms.join(item.gitterChannel, (err, room) => {
                this.connectedChannels[item.ircChannel] = room;

                var events = room.streaming().chatMessages();

                events.on('chatMessages', (message) => {
                    if (message.operation == 'create') {
                        try {
                            if (message.model.fromUser.username != this.ircConfig.gitterNickname) {
                                MessageParser.parseMessage(message.model.html, this.ircClient, item.ircChannel, (sendToIrc, message) => {
                                    if (sendToIrc) {
                                        this.ircClient.say(item.ircChannel, entities.decode(Strip(message)));
                                    } else {
                                        room.send(message);
                                    }
                                });
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                });
            });
        });
    }

    initIrcEvents() {
        var channels = {};

        this.ircConfig.channels.forEach((item) => {
            if (typeof item['gitterActivityUrl'] != 'undefined') {
                channels[item['ircChannel']] = item['gitterActivityUrl'];
            }
        });

        this.ircClient.on('message', (from, to, message) => {
            if (typeof this.connectedChannels[to] != 'undefined' && from != this.ircNick) {
                this.connectedChannels[to].send("**" + from + ":** " + message);
            }
        });

        this.ircClient.on('join', (channel, nick, message) => {
            if (typeof channels[channel] != 'undefined' && nick != this.ircNick) {
                this.sendGitterWebhookMessage(channels[channel], "**JOIN**: " + nick);
            }
        });

        this.ircClient.on('part', (channel, nick, message) => {
            if (typeof channels[channel] != 'undefined' && nick != this.ircNick) {
                this.sendGitterWebhookMessage(channels[channel], "**LEAVE**: " + nick);
            }
        });

        this.ircClient.on('quit', (nick, reason, channels, message) => {
            channels.forEach((channel) => {
                if (typeof channels[channel] != 'undefined' && nick != this.ircNick) {
                    this.sendGitterWebhookMessage(channels[channel], "**QUIT**: " + nick);
                }
            });
        });

        this.ircClient.on('error', (message) => {
            if (typeof this.pmChannel != 'undefined') {
                this.pmChannel.send(JSON.stringify(message));
            }
            console.log(message);
        });

        if (typeof this.ircConfig.debug != 'undefined' && this.ircConfig.debug == true) {
            this.ircClient.on('raw', (message) => {
                console.log(message);
            });
        }

        this.ircClient.on('kick', (channel, nick, by, reason) => {
            if (typeof channels[channel] != 'undefined' && nick != this.ircNick) {
                this.sendGitterWebhookMessage(channels[channel], "**KICK**: " + nick.toString() + ' Reason: ' + reason.toString() + ', by: ' + by.toString());
            }
        });
    }

    initPmChannel() {
        this.gitter.rooms.join(this.ircConfig.gitterPmChannel, (err, room) => {
            this.pmChannel = room;

            var events = room.streaming().chatMessages();

            events.on('chatMessages', (message) => {
                if (message.operation == 'create') {
                    try {
                        if (message.model.fromUser.username != this.ircConfig.gitterNickname) {
                            var splitText = message.model.text.split(':');
                            if (splitText.length > 1) {
                                var messageStr = "";
                                for (var i = 1; i < splitText.length; i++) {
                                    messageStr = messageStr + ":" + splitText[i];
                                }
                                this.lastPmUser = splitText[0];
                                this.ircClient.say(splitText[0], messageStr);
                            } else if(typeof this.lastPmUser != 'undefined') {
                                this.ircClient.say(this.lastPmUser, message.model.text);
                            }
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            });
        });

        this.ircClient.addListener('pm', (from, message) => {
            this.pmChannel.send("**" + from + ":** " + message);
        });
    }

    sendGitterWebhookMessage(url, message) {
        request.post(url, {
            form: {
                message: message
            }
        });
    }
}

module.exports = Gitter2Irc;