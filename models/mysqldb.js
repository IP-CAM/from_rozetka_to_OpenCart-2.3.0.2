var mysql = require('mysql');

// exports.connection = mysql.createConnection({
//         host: "127.0.0.1",
//         user: "root",
//         password: "",
//         database: "opencart",
//         multipleStatements: true,//опция позволяет отправлять несколько запросов подряд
//         debug: false // режим отладки
//         });

//connection.connect();

//connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//  if (error) throw error;
//  console.log('The solution is: ', results[0].solution);
//});
//
//connection.end();

exports.pool      =    mysql.createPool({
    connectionLimit : 1000, //important
    queueLimit: 100,
    waitForConnections: true,
    acquireTimeout: 10000,
    
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : 'opencart',
    multipleStatements: true,
    debug    :  false
});