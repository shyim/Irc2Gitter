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

    parseMessage(messageHtml, callback) {
        this.getCode(messageHtml, (code) => {
            if (code == false) {
                callback(messageHtml);
            } else {
                callback(code);
            }
        });
    }
}

module.exports = new Message;