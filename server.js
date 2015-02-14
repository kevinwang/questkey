var express = require('express');
var db = require('./models');

var app = express();
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    res.render('index');
});

db.sequelize.sync()
.complete(function(err) {
    if (err) {
        throw err[0];
    } else {
        app.listen(4000);
    }
});
