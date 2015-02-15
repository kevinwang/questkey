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

app.get('/quests/:id', function(req, res) {
    db.Quest.find({
        where: {id: req.params.id},
        include: [{model: db.User, as: 'Owner'}, db.User]
    })
    .then(function(quest) {
        if (!quest) return res.redirect('/');
        quest.getOwner().then(function(owner) {
            res.render('quest', {
                user: req.user,
                quest: quest,
                owner: owner,
                isUserOwner: req.user && req.user.id === quest.Owner.id
            });
        });
    });
});

app.get('/quests/:id/end', function(req, res) {
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

app.get('/u/:username/reward', ensureAuthenticated, function(req, res) {
    db.User.find({
        where: {username: req.params.username}
    })
    .then(function(user) {
        user.increaseExperience(50);
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
