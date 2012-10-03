var express = require ('express');
var mysql = require('mysql');
var config = require('./config');
  
app = express.createServer();
app.set('view engine', 'jade');
app.set('views',__dirname + '/views');
app.set('view options', { layout: false });

var db = mysql.createConnection(config);
app.use(express.bodyParser());

// main route
app.get('/', function (req, res, next) {
	db.query('SELECT firstname, lastname from student', function (err, results) {
		res.render('index', { items: results });
	});
});

// item create
app.post('/create', function (req, res, next) {
	console.log('create called');
	var firstname=req.query.firstname;
	var lastname=req.query.lastname;
	console.log('Creating: '+firstname+' '+lastname);
	db.query('INSERT INTO student SET firstname = ?, lastname = ?',
	[firstname, lastname], function (err, info) {
		if (err) return next(err);
		console.log('item created with id %s', info.insertID);
		res.send('item created with id %s', info.insertID);
	});
});

//item route
app.get('/item/:id', function(req, res, next) {
	
});

// listen
app.listen(3000, function () {
	console.log(' - listening on http://*:3000');
});
