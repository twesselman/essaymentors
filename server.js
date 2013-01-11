var express = require ('express');
var mongodb = require('mongodb');
var passport = require('passport');
var LocalStrategy=require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var server = express.createServer();

server.configure(function() {
  server.use(express.bodyParser());  
  server.use(express.cookieParser());
  server.use(express.session({secret: 'my super secret' }));
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(express.static(__dirname + '/website'));
  server.use(express.static(__dirname + '/scripts'));
});

var dbserver = new mongodb.Server('ds037987.mongolab.com', 37987);
var dbMongo = new mongodb.Db('heroku_app8094430', dbserver);

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
        server.students = new mongodb.Collection(dbMongo, 'students');
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log('invoking LocalStrategy with username: ' + username + ' password: ' + password);
        server.students.findOne({ username: username }, function(err, user) {
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
    server.students.findOne({ username: id.username }, function(err, user) {
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
        server.students.findOne({ username: "twesselman" }, function(err, user) {
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
server.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
server.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/signmein' }));
                                      
// Routes   *******************************************************************************************************************

server.post('/signmeup', function(req, res) {
    console.log('signmeup called');
    
    console.log(req.body.student);
    server.students.insert(req.body.user, function (err, doc) {
        if (err) return next(err);
     });
     
    req.session.currentuser=req.body.user.username;
    req.session.logedin=true;
    
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
    default: {
        res.send('oops');
    }
    }
});
   
server.post('/signmein', function(req, res) {
    console.log('signmein called');
    // Todo: process login
    
   // Todo: replace below with looking up the user type
   
    req.session.currentuser = req.body.user.username;
    req.session.loggedin=true;
    
     switch(req.body.user.user_type) {
    case "student": {
        res.end('Logged in!');
        //res.redirect('studentmain.html');
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
    default: {
        res.send('oops');
        }
    }  
});

server.post('/set', function(req, res) {
    req.session.currentuser = req.body.username;
    res.send("currentuser set to: "+req.session.currentuser);
});

server.get('/currentuser', function (req, res) {
    console.log('currentuser called');
    
    if (req.session.currentuser)
    {
        res.send(req.session.currentuser);
    }
    else
    {
        res.send("No one logged in");
    }
});
    
   
server.get('/test', function(req, res) {
    console.log('test called');
    res.send("Awesome!")
});
   
server.get('/done', function(req, res) {
    console.log('done called');
    res.redirect('/index.html');
});


server.post('/login', 
    passport.authenticate('local',
        { successRedirect: '/',
          failureRedirect: '/login',
          failureFlash: true,
          successFlash: 'Welcome to Essay Mentors'}
        )
    );
    
server.get('/logout', function (req, res) {
    console.log('logout called');

    req.session.currentuser = '';
    req.session.loggedin=false;

    req.logOut();
    res.redirect('/');
});
        

server.get('/loggedin', function (req, res, next) {
    res.send('logged in');
});

// get students
server.get('/students', function (req, res, next) {
    console.log('get students called');
    
    server.students.find().toArray(function(err, documents) {
        console.log(documents);
        res.send(documents);
    });
});

function holder(res) {
    var cursor = server.students.find({ });
    res.write('{');
    cursor.each(function(err, item) {
        console.log(item);
        res.write(item.toString());
    });
    res.write('}');
    res.end();


    var stream = server.students.find({}).stream();
        
    stream.on('data', function(data) {
        res.write(data);
    });
    
    stream.on('end', function() {
        res.end();
    });
}


// student create
server.post('/createstudent', function (req, res, next) {
	console.log('create called');
    console.log(req.body.student);
	server.students.insert(req.body.student, function (err, doc) {
        if (err) return next(err);
       res.send('go go');
	});
    res.send('ok');
});

// listen
var port = process.env.PORT || 3000;
server.listen(port, function () {
	console.log(' - listening on '+port);
    
});