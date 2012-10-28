var express = require ('express');
var mongodb = require('mongodb');
var passport = require('passport');
var LocalStrategy=require('passport-local').Strategy;

var app = express.createServer();

app.use(express.static(__dirname + '/website'));
app.use(express.static(__dirname + '/scripts'));
app.use(express.bodyParser());

var server = new mongodb.Server('ds037987.mongolab.com', 37987);

var dbMongo = new mongodb.Db('heroku_app8094430', server);
dbMongo.open(function on_open(err, dbMongo) {
    if (err) {
        console.log(err);
        throw(err);
    }
    console.log('Mongo db opened');
    dbMongo.authenticate('emadmin', 'empassword', function on_authenticated(err, result) {
        if (err) {
            console.log(err);
            throw(err);
        }
        console.log('db authenticated');
        app.students = new mongodb.Collection(dbMongo, 'students');
    });
});

app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log('invoking LocalStrategy with username: ' + username + ' password: ' + password);
        app.students.findOne({ username: username }, function(err, user) {
            if(err) {return done(err); }
            if(!user) {
                console.log('user not found');
                return done(null, false, {message: 'Unknown user' });
            }
            if (password != user.password) {
                console.log('invalid password');
                return done(null, false, { message: 'Invalid password' });
            }
            console.log('validated');
            return done(null, user);
        });
    }));
    
passport.serializeUser(function(user, done) {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser' + id);
    app.students.findOne({ username: id.username }, function(err, user) {
        if (err) {return done(err); }
        if (!user) {
            return done(null, false, {message: 'Unknown user' });
        }
        return done(null, user);
    });
});


// Routes   

app.post('/login', 
    passport.authenticate('local',
        { successRedirect: '/',
          failureRedirect: '/login',
          failureFlash: true,
          successFlash: 'Welcome to Essay Mentors'}
        )
    );
    
app.get('/loggedin', function (req, res, next) {
    res.send('logged in');
});

// get students
app.get('/students', function (req, res, next) {
    console.log('get students called');
    app.students.findAll({ }, function(err, users) {
        if (err) {
            console.log('error getting students');
            res.send('error getting students');
        }
        res.send(users);
    });
});

// student create
app.post('/createstudent', function (req, res, next) {
	console.log('create called');
    console.log(req.body.student);
	app.students.insert(req.body.student, function (err, doc) {
        if (err) return next(err);
       res.send('go go');
	});
    res.send('ok');
});

//item route
app.get('/item/:id', function(req, res, next) {
	
});

// listen
var port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log(' - listening on '+port);
});
