var mysql = require('mysql');
var config = require('./config');

var db = mysql.createConnection(config);

//db.connect();
console.log('connected to ' + config.database);

db.query('USE `heroku_f08564c7c263530`');
console.log('use heroku_f08564c7c263530');

db.query('DROP TABLE IF EXISTS item');
console.log('droped table');

db.query('CREATE TABLE student (' +
    'id INT(11) AUTO_INCREMENT,' +
    'firstname VARCHAR(255),' + 
    'lastname VARCHAR(255),' + 
    'created DATETIME,' +
    'PRIMARY KEY (id))');
console.log('created student table');

db.query('DROP TABLE IF EXISTS review');
console.log('dropped review');

db.query('CREATE TABLE mentor (' +
    'id INT(11) AUTO_INCREMENT,' +
    'item_id INT(11),'  +
    'firstname VARCHAR(255),' + 
    'lastname VARCHAR(255),' + 
    'created DATETIME,' +
    'PRIMARY KEY (id))');
console.log('created mentor');
    
db.end();
console.log('end');

    

