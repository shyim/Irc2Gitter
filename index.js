const Gitter2Irc = require('./component/Gitter2Irc'),
    Config = JSON.parse(require('fs').readFileSync('config.json'));
/**
 * Load Gitter Clients
 */
Object.keys(Config).forEach(function (key) {
    new Gitter2Irc(key, Config[key]);
});