var express = require ('express');
var mysql = require('mysql');
var config = require('./config.json');
console.log('db connection: '+config.database);
var connect = require('connect');


app = express.createServer();

app.use(connect.static(__dirname + '/website'));
app.use(connect.static(__dirname + '/scripts'));

var db = mysql.createConnection(config);
//app.use(express.bodyParser());


// get students
app.get('/students', function (req, res, next) {
	db.query('SELECT firstname, lastname from student', function (err, results) {
		res.send(results);
	});
});

// student create
app.post('/createstudent', function (req, res, next) {
	console.log('create called');
	var firstname=req.query.firstname;
	var lastname=req.query.lastname;
	console.log('Creating: '+firstname+' '+lastname);
	db.query('INSERT INTO student SET firstname = ?, lastname = ?',
	[firstname, lastname], function (err, info) {
		if (err) return next(err);
		console.log('item created with id %s', info.insertID);
		res.send('item created with id %s', info.insertID)
	});
});

//item route
app.get('/item/:id', function(req, res, next) {
	
});

// listen
var port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log(' - listening on http://*:3000');
});
