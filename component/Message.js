"use strict";

var dPaste = require("./dPaste.js");

class Message {
    getCode(html, callback) {
        var indexStart = html.indexOf("<code>");
        if (indexStart > -1) {
            var indexEnd = html.indexOf("</code>");
            var startString = html.substring(0, indexStart);
            var endString = html.substring(indexEnd + 7, html.length);
            var code = html.substring(indexStart + 6, indexEnd);

            dPaste.create(code, (url) => {
                var string = '';

                if (startString.trim().length > 0) {
                    string = startString.trim() + ' ';
                }

                callback(string + url + ' ' + endString.trim());
            });
        } else {
            callback(false);
        }
    }

    parseMessage(messageHtml, ircClient, channel, callback) {
        switch (true) {
            case messageHtml.indexOf('/chlist') == 0:
                if (typeof ircClient.chans[channel] != 'undefined') {
                    var str = "Currently Online users:\n";

                    Object.keys(ircClient.chans[channel].users).forEach((user) => {
                        str += '**' + user + "\n";
                    });

                    callback(false, str);
                }
                break;
            case messageHtml.indexOf('/whois') == 0:
                ircClient.whois(messageHtml.replace('/whois'), (message) => {
                    callback(false, message.toString());
                });
                break;
            default:
                this.getCode(messageHtml, (code) => {
                    if (code == false) {
                        callback(true, messageHtml);
                    } else {
                        callback(true, code);
                    }
                });
                break;
        }
    }
}

module.exports = new Message;