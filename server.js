var express = require ('express');
var mongodb = require('mongodb');
var passport = require('passport');
var LocalStrategy=require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

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

passport.use(new FacebookStrategy({
    clientID: "294130124020385",
    clientSecret: "8d43f4660ef13b15cd43384d0281bf96",
    callbackURL: "http://essaymentors.twesselman.c9.io/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      console.log(profile);
        app.students.findOne({ username: "twesselman" }, function(err, user) {
            if(err) {return done(err); }
            if(!user) {
                console.log('user not found');
                return done(null, false, {message: 'Unknown user' });
            }
            console.log('validated from Facebook');
            return done(null, user);
        });
  }
));

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
// /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));
                                      
// Routes   *******************************************************************************************************************


app.post('/signmeup', function(req, res) {
    console.log('signmeup called');
    
    console.log(req.body.student);
    app.students.insert(req.body.student, function (err, doc) {
        if (err) return next(err);
       res.send('go go');
	});
    
    switch(req.body.user_type) {
    case "student": {
        res.redirect('/studentmain.html');
        }
        break;
    case "parent": {
        res.redirect('/parentmain.html');
        }
        break;
    case "mentor": {
        res.redirect('/mentormain.html');
        }
        break;
    }

});
   
app.post('/signmein', function(req, res) {
    console.log('signmein called');
    // process login
    
    // determine main page based on login user
    res.redirect('/studentmain.html');
});
   
app.get('/test', function(req, res) {
    console.log('test called');
    res.redirect('/signup.html');
});
   
app.get('/done', function(req, res) {
    console.log('done called');
    res.redirect('/index.html');
});


app.post('/login', 
    passport.authenticate('local',
        { successRedirect: '/',
          failureRedirect: '/login',
          failureFlash: true,
          successFlash: 'Welcome to Essay Mentors'}
        )
    );
    
app.get('/logout', function (req, res) {
    console.log('logout called');
    
    req.logOut();
    res.redirect('/');
});
        
app.get('/currentuser', function (req, res) {
    console.log('currentuser called');
    
    res.send(req.user);
});
    
app.get('/loggedin', function (req, res, next) {
    res.send('logged in');
});

// get students
app.get('/students', function (req, res, next) {
    console.log('get students called');
    
    app.students.find().toArray(function(err, documents) {
        console.log(documents);
        res.send(documents);
    });
});

function holder(res) {


    var cursor = app.students.find({ });
    res.write('{');
    cursor.each(function(err, item) {
        console.log(item);
        res.write(item.toString());
    });
    res.write('}');
    res.end();


    var stream = app.students.find({}).stream();
        
    stream.on('data', function(data) {
        res.write(data);
    });
    
    stream.on('end', function() {
        res.end();
    });
}


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
