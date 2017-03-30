var mysql = require('mysql');

exports.connection = mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "opencart",
        multipleStatements: true
        });

//connection.connect();

//connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//  if (error) throw error;
//  console.log('The solution is: ', results[0].solution);
//});
//
//connection.end();