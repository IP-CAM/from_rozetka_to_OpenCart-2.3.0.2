//var mysql = require('mysql');
var mysql = require('../node_modules/mysql/');

exports.connection = mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "opencart"
        });