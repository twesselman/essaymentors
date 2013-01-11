var express = require ('express');
var mongodb = require('mongodb');
var passport = require('passport');
var flash = require('connect-flash');
var LocalStrategy=require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var server = express();

server.configure(function() {
  server.use(express.bodyParser());  
  server.use(express.cookieParser()); // must be before session initialization
  server.use(express.session({secret: 'my super secret' }));
  server.use(flash());
  server.use(passport.initialize());
  server.use(passport.session()); // must follow using express.session
  //server.use(server.router);   needed???
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

// Passport stuff ******************************************************************************************************************************************


passport.serializeUser(function(user, done) {
    console.log('serializeUser: ' + user.username);
    done(null, user.username); // serialize using username for now
});

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser: id: ' + id); // id is username for now
    
    server.students.findOne({ username: id }, function(err, user) {
        if (err) {
            console.log('deserializeUser: Error ' + err);
            return done(err); 
        }
        if (!user) {
            console.log('deserializeUser: id not found: ' + id);
            return done(null, false, {message: 'Unknown user' });
        }
        console.log('deserializeUser: id found: ' + id);
        console.log(user);
        return done(null, user);
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
            return done(null, user); // user now passed to serializeUser
        });
    }));
    
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
  passport.authenticate('facebook', { successRedirect: '/mentormain.html',
                                      failureRedirect: '/login.html' }));
                                      
// Routes   *******************************************************************************************************************

server.post('/signmeup', function(req, res) {
    console.log('signmeup called');
    
    console.log(req.body.student);
    server.students.insert(req.body.user, function (err, doc) {
        if (err) return err;
     });
     
    res.redirect('/login.html');
});

server.get('/currentuser', function (req, res) {
    console.log('currentuser called');
    
    if (req.user)
    {
        res.send(req.user.username);
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

server.get('/usermainpage', function(req, res) {
    console.log('usermainpage called');
    switch(req.user.user_type) {
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

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
server.post('/auth/local', 
    passport.authenticate('local', { 
        successRedirect: '/usermainpage',
        failureRedirect: '/login.html',
        failureFlash: true,
        successFlash: 'Welcome to Essay Mentors'
    })
);
    
server.get('/logout', function (req, res) {
    console.log('logout called');

    // passport stuff
    req.logOut();
    res.redirect('/');
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