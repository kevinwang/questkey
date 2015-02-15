var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
var async = require('async');
var path = require('path');

var db = require('./models');
var passport = require('./authentication');

var app = express();
app.set('view engine', 'jade');

app.use(session({
    store: new SQLiteStore({dir: 'store'}),
    secret: 'secret enough',
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
    if (req.isAuthenticated()) return res.redirect('/home');
    res.render('index');
});

app.get('/login', function(req, res) {
    if (req.isAuthenticated()) return res.redirect('/home');
    res.render('login');
});

app.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/login'
}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/home', ensureAuthenticated, function(req, res) {
    async.parallel({
        ownedQuests: function(callback) {
            req.user.getOwnedQuests().then(function(ownedQuests) {
                callback(null, ownedQuests);
            });
        },
        quests: function(callback) {
            req.user.getQuests().then(function(quests) {
                callback(null, quests);
            });
        }
    }, function(err, results) {
        res.render('home', {
            user: req.user,
            ownedQuests: results.ownedQuests,
            quests: results.quests
        });
    });
});

app.get('/quests', function(req, res) {
    db.Quest.findAll({
        include: [{model: db.User, as: 'Owner'}]
    })
    .then(function(quests) {
        res.render('questlist', {
            user: req.user,
            quests: quests
        });
    });
});

app.post('/quests', ensureAuthenticated, function(req, res) {
    if (isNaN(parseInt(req.body.reward))) res.redirect('/quests/new');
    db.Quest.create({
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        reward: parseInt(req.body.reward)
    })
    .then(function(quest) {
        quest.setOwner(req.user).then(function() {
            res.redirect(quest.path);
        });
    });
});

app.get('/quests/new', ensureAuthenticated, function(req, res) {
    res.render('newquest', {
        user: req.user
    });
});

app.get('/quests/:id', function(req, res) {
    db.Quest.find({
        where: {id: req.params.id},
        include: [{model: db.User, as: 'Owner'}, db.User]
    })
    .then(function(quest) {
        if (!quest) return res.redirect('/');
        quest.getOwner().then(function(owner) {
            quest.hasUser(req.user)
            .then(function(isUserInQuest) {
                res.render('quest', {
                    user: req.user,
                    quest: quest,
                    owner: owner,
                    isUserOwner: req.user && req.user.id === quest.Owner.id,
                    isUserInQuest: isUserInQuest
                });
            });
        });
    });
});

app.get('/quests/:id/join', ensureAuthenticated, function(req, res) {
    db.Quest.find({
        where: {id: req.params.id}
    })
    .then(function(quest) {
        quest.addUser(req.user).then(function() {
            res.redirect(quest.path);
        });
    });
});

app.get('/quests/:id/leave', ensureAuthenticated, function(req, res) {
    db.Quest.find({
        where: {id: req.params.id}
    })
    .then(function(quest) {
        quest.removeUser(req.user).then(function() {
            res.redirect(quest.path);
        });
    });
});

app.get('/quests/:id/complete', function(req, res) {
    db.Quest.find({
        where: {id: req.params.id}
    })
    .then(function(quest) {
        if (!quest) return res.redirect('/');
        if (quest.status !== 'in progress') return res.redirect(quest.path);
        quest.getUsers().then(function(users) {
            async.each(users, function(user, callback) {
                user.increaseExperience(quest.reward);
                callback();
            }, function(err) {
                quest.updateAttributes({status: 'done'})
                .then(function() {
                    res.redirect(quest.path);
                });
            });
        });
    });
});

app.get('/quests/:id/cancel', function(req, res) {
    db.Quest.find({
        where: {id: req.params.id}
    })
    .then(function(quest) {
        if (!quest) return res.redirect('/');
        if (quest.status !== 'in progress') return res.redirect(quest.path);
        quest.updateAttributes({status: 'canceled'})
        .then(function() {
            res.redirect(quest.path);
        });
    });
});

app.get('/u/:username', function(req, res) {
    db.User.find({
        where: {username: req.params.username}
    })
    .then(function(theUser) {
        if (!theUser) return res.redirect('/');
        async.parallel({
            ownedQuests: function(callback) {
                theUser.getOwnedQuests().then(function(ownedQuests) {
                    callback(null, ownedQuests);
                });
            },
            quests: function(callback) {
                theUser.getQuests().then(function(quests) {
                    callback(null, quests);
                });
            }
        }, function(err, results) {
            res.render('user', {
                user: req.user, // Currently logged-in user
                theUser: theUser,  // User for the page being rendered
                ownedQuests: results.ownedQuests,
                quests: results.quests
            });
        });
    });
});

app.get('/u/:username/reward/:amount', ensureAuthenticated, function(req, res) {
    db.User.find({
        where: {username: req.params.username}
    })
    .then(function(user) {
        user.increaseExperience(parseInt(req.params.amount));
        res.redirect(user.path);
    });
});

app.get('/css/:filename', function(req, res) {
    res.sendFile(path.join(__dirname, 'css', req.params.filename));
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.redirect('/login');
}

db.sequelize.sync({force: true})
.then(function(err) {
    require('./seed-db')();
    app.listen(4000);
})
.catch(function(err) {
    throw err[0];
});
