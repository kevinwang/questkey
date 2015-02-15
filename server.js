var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
var bcrypt = require('bcrypt');
var async = require('async');

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

app.get('/reward_me', ensureAuthenticated, function(req, res) {
    req.user.increaseExperience(50);
    res.redirect('/home');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.redirect('/login');
}

db.sequelize.sync({force: true})
.then(function(err) {
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
                location: 'Cooper Union'
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
    app.listen(4000);
})
.catch(function(err) {
    throw err[0];
});
