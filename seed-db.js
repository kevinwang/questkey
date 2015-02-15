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
                description: "Selfies master cleanse retro single-origin coffee flexitarian +1 PBR&B. Pork belly pop-up occupy raw denim, bespoke next level yr leggings pug taxidermy artisan. Tousled plaid master cleanse locavore, mlkshk migas keffiyeh Kickstarter quinoa tattooed. Next level vegan iPhone, direct trade sustainable sartorial health goth migas post-ironic asymmetrical umami. Williamsburg four loko post-ironic, cornhole lomo authentic twee. Before they sold out trust fund you probably haven't heard of them, vinyl ennui vegan jean shorts artisan. Roof party food truck dreamcatcher, Helvetica beard Intelligentsia craft beer tofu scenester.",
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
                bcrypt.hash('password', 10, function(err, hash) {
                    db.User.create({
                        username: 'eric',
                        password: hash,
                        email: 'ericc6134@gmail.com'
                    })
                    .then(function(user) {
                        quest.addUser(user);
                    });
                });
            });
        });
    });
}
