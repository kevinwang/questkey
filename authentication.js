var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var db = require('./models');

passport.use('login', new LocalStrategy(function(username, password, done) {
    db.User.find({
        where: {username: username}
    })
    .then(function(user) {
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, function(err, res) {
            if (!res) return done(null, false);
            done(null, user);
        });
    });
}));

passport.use('signup', new LocalStrategy({
    passReqToCallback: true
}, function(req, username, password, done) {
    db.User.find({
        where: {username: username}
    })
    .then(function(user) {
        bcrypt.hash(password, 10, function(err, hash) {
            db.User.create({
                username: username,
                password: hash,
                email: req.body.email
            })
            .then(function(user) {
                done(null, user);
            });
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.username);
});

passport.deserializeUser(function(username, done) {
    db.User.find({
        where: {username: username}
    })
    .then(function(user) {
        done(null, user);
    });
});

module.exports = passport;
