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
        .then(function(kevin) {
            db.Quest.create({
                title: 'Make me a sandwich',
                description: "Selfies master cleanse retro single-origin coffee flexitarian +1 PBR&B. Pork belly pop-up occupy raw denim, bespoke next level yr leggings pug taxidermy artisan. Tousled plaid master cleanse locavore, mlkshk migas keffiyeh Kickstarter quinoa tattooed. Next level vegan iPhone, direct trade sustainable sartorial health goth migas post-ironic asymmetrical umami. Williamsburg four loko post-ironic, cornhole lomo authentic twee. Before they sold out trust fund you probably haven't heard of them, vinyl ennui vegan jean shorts artisan. Roof party food truck dreamcatcher, Helvetica beard Intelligentsia craft beer tofu scenester.",
                location: 'Cooper Union',
                reward: 250
            })
            .then(function(quest) {
                quest.setOwner(kevin);
                bcrypt.hash('password', 10, function(err, hash) {
                    db.User.create({
                        username: 'shan',
                        password: hash,
                        email: 'shan@theytookmydomain.net'
                    })
                    .then(function(shan) {
                        quest.addUser(shan);
                    });
                });
                bcrypt.hash('password', 10, function(err, hash) {
                    db.User.create({
                        username: 'eric',
                        password: hash,
                        email: 'ericc6134@gmail.com'
                    })
                    .then(function(eric) {
                        quest.addUser(eric);
                        db.Quest.create({
                            title: 'Help me move across town',
                            description: "Deep v viral Pitchfork before they sold out literally, High Life flannel banjo shabby chic fanny pack meggings chambray street art chia normcore. Beard cornhole seitan roof party, lo-fi forage hella church-key leggings heirloom polaroid whatever keytar squid sriracha. Literally Truffaut Godard chillwave, Pitchfork cold-pressed kogi Kickstarter occupy distillery freegan. Pinterest meggings gastropub stumptown, retro art party disrupt iPhone PBR. Sriracha post-ironic kitsch, cliche gentrify brunch Kickstarter seitan twee Banksy. Pour-over cardigan fanny pack fap direct trade. Crucifix craft beer Intelligentsia 8-bit synth Echo Park.",
                            location: 'Tribeca',
                            reward: 500
                        })
                        .then(function(quest) {
                            quest.setOwner(eric);
                            quest.addUser(kevin);
                        });
                    });
                });
            });
        });
    });
}
