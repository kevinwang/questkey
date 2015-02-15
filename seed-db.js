var bcrypt = require('bcrypt');
var db = require('./models');

/**
 * Seed the database with test data.
 */
module.exports = function() {
    bcrypt.hash('password', 10, function(err, hash) {
        db.User.create({
            username: 'kevin',
            password: hash,
            email: 'kevin@kevinwang.com'
        })
        .then(function(user) {
            db.Quest.create({
                title: 'Make me a sandwich',
                description: 'Sudo make me a sandwich',
                location: 'Cooper Union',
                reward: 250
            })
            .then(function(quest) {
                quest.setOwner(user);
                bcrypt.hash('password', 10, function(err, hash) {
                    db.User.create({
                        username: 'shan',
                        password: hash,
                        email: 'shan@theytookmydomain.net'
                    })
                    .then(function(user) {
                        quest.addUser(user);
                    });
                });
            });
        });
    });
}
