var gitterRoom;
var gitterUserName = '';
var gitterRoomName = 'shyim/shopware-irc-bridge';
var gitterToken = '';
var ircRoomName = "#shopware";
var ircServer = 'kornbluth.freenode.net';
var ircName = 'shyim';

/**
    IRC Client
*/
var irc = require('irc');
var client = new irc.Client(ircServer, ircName, {
    channels: [ircRoomName]
});

/**
    Gitter Client

**/
var Gitter = require('node-gitter');

var gitter = new Gitter(gitterToken);

gitter.rooms.join(gitterRoomName, function(err, room) {
    gitterRoom = room;

    var events = room.streaming().chatMessages();

    events.on('chatMessages', function(message) {
        if(message.operation == 'create') {
            try {
                if(message.model.fromUser.username != gitterUserName) {
                    client.say(ircRoomName, message.model.text);
                }
            } catch(err) {
                console.log(message);
            }
        }    
    });
});
