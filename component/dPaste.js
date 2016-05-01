const request = require('request');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

exports.create = function (content, callback) {
    request.post('https://dpaste.de/api/', {
        formData: {
            content: entities.decode(content),
            format: 'url',
            lexer: 'text'
        }
    }, (err, httpResponse, body) => {
        callback(body);
    });
};