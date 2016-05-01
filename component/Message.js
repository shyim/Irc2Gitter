"use strict";

var dPaste = require("./dPaste.js");

class Message {
    getCode (html, callback) {
        var indexStart = html.indexOf("<code>");
        if(indexStart > -1) {
            var indexEnd = html.indexOf("</code>");
            var startString = html.substring(0, indexStart);
            var endString = html.substring(indexEnd + 7, html.length);
            var code = html.substring(indexStart + 6, indexEnd);

            dPaste.create(code, (url) => {
                if (startString.trim().length == 0) { startString = '';}
                if (endString.trim().length == 0) { endString = '';}

                callback(startString + url + endString);
            });
        } else {
            callback(false);
        }
    }

    parseMessage (messageHtml, callback) {
        this.getCode(messageHtml, (code) => {
            if(code == false) {
                callback(messageHtml);
            } else {
                callback(code);
            }
        });
    }
}

module.exports = new Message;