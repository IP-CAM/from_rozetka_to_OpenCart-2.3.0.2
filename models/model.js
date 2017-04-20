//нужно сделать
//---------------------------------------------
// Добавление категории 33(Cameras) в sql запросе
//вычисление даты сервером sql
//--------------------------------------------------
var mysqldb = require('./mysqldb'); // блок подключения к базе данных
var log = require('cllc')(); //библиотека для вывода сообщений в консоль
var tress = require('tress');

exports.insertProductInMysql = function (result_oc_product, result_oc_product_description, result_oc_product_to_category, images, cb) {
    // старт транзакции
    mysqldb.connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }

        //Добавление первого запроса если ошибка то откат
        var resQuery = mysqldb.connection.query('INSERT INTO `oc_product` SET ?;SET @lastID := LAST_INSERT_ID();', result_oc_product, function (error, results, fields) {
            if (error) {
                console.log(result_oc_product);
                return mysqldb.connection.rollback(function () {
                    //throw error;
                });
            }

            //Добавление второго запроса если ошибка то откат
            mysqldb.connection.query('REPLACE INTO `oc_product_description` SET `product_id`= @lastID,?', result_oc_product_description, function (error, results, fields) {
                if (error) {
                    //console.log(result_oc_product_description);
                    return mysqldb.connection.rollback(function () {
                        //throw error;
                    });
                }

                //Добавление третьего запроса если ошибка то откат
                mysqldb.connection.query('REPLACE INTO `oc_product_to_category` SET `product_id`= @lastID,?;REPLACE INTO `oc_product_to_store` VALUE(@lastID,"0");', result_oc_product_to_category, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        return mysqldb.connection.rollback(function () {
                            //throw error;
                        });
                    }

                    //Динамическое формирование четвертого запроса
                    if (results && results != "") {
                        var query = 'REPLACE INTO `oc_product_image` VALUE';
                        for (var url in images) {
                            query += '("", @lastID, "' + images[url] + '", "0"),';
                        }
                        query = query.slice(0, -1);

                        mysqldb.connection.query(query, function (error, results, fields) {
                            if (error) {
                                return mysqldb.connection.rollback(function () {
                                    //throw error;
                                });
                            }

                            mysqldb.connection.commit(function (err) {
                                if (err) {
                                    return mysqldb.connection.rollback(function () {
                                        throw err;
                                    });
                                }
                                //mysqldb.connection.end();
                                log.step(0, 0, 1);
                                //console.log('success!');
                            });

                        }); //четвертый инсерт
                    } else {
                        mysqldb.connection.commit(function (err) {
                            if (err) {
                                return mysqldb.connection.rollback(function () {
                                    throw err;
                                });
                            }
                            //mysqldb.connection.end();
                            //console.log('success!');
                        });
                    }
                }); //третий инсерт
            }); //второй инсерт
        }); //первый инсерт
    });
}
//
// exports.insertCameraInMysql = function (result_oc_product, result_oc_product_description, result_oc_product_to_category, images, cb) {
//     mysqldb.pool.getConnection(function (err, connection) {
//         // старт транзакции
//         mysqldb.connection.beginTransaction(function (err) {
//             if (err) {
//                 throw err;
//             }
//
//             //Добавление первого запроса если ошибка то откат
//             mysqldb.connection.query('INSERT INTO `oc_product` SET ?;SET @lastID := LAST_INSERT_ID();', result_oc_product, function (error, results, fields) {
//                 if (error) {
//                     console.log('Ошибка в 1 запросе');
//                     return mysqldb.connection.rollback(function () {
//                         throw error;
//                     });
//                 }
//
//                 //Добавление второго запроса если ошибка то откат
//                 mysqldb.connection.query('INSERT INTO `oc_product_description` SET `product_id`= @lastID,?', result_oc_product_description, function (error, results, fields) {
//                     if (error) {
//                         console.dir(error);
//                         return mysqldb.connection.rollback(function () {
//                             throw error;
//                         });
//                     }
//
//                     //Добавление третьего запроса если ошибка то откат
//                     mysqldb.connection.query('INSERT INTO `oc_product_to_category` SET `product_id`= @lastID,?;INSERT INTO `oc_product_to_category` VALUE(@lastID,"33");INSERT INTO `oc_product_to_store` VALUE(@lastID,"0");', result_oc_product_to_category, function (error, results, fields) {
//                         if (error) {
//                             console.dir(error);
//                             return mysqldb.connection.rollback(function () {
//                                 throw error;
//                             });
//                         }
//
//                         //Динамическое формирование четвертого запроса
//                         if (results && results != "") {
//                             var query = 'INSERT INTO `oc_product_image` VALUE';
//                             for (var url in images) {
//                                 query += '("", @lastID, "' + images[url] + '", "0"),';
//                             }
//                             query = query.slice(0, -1);
//
//                             mysqldb.connection.query(query, function (error, results, fields) {
//                                 if (error) {
//                                     console.log('Ошибка в последнем запросе');
//                                     return mysqldb.connection.rollback(function (error) {
//                                         //throw error;
//                                     });
//                                 }
//
//                                 mysqldb.connection.commit(function (err) {
//                                     if (err) {
//                                         return mysqldb.connection.rollback(function () {
//                                             console.log('ошибка коммита');
//                                             //throw err;
//                                         });
//                                     }
//                                     //mysqldb.connection.end();
//                                     log.step(0, 0, 1);
//                                     //console.log('success!');
//                                 });
//
//                             }); //четвертый инсерт
//                         } else {
//                             mysqldb.connection.commit(function (err) {
//                                 if (err) {
//                                     return mysqldb.connection.rollback(function () {
//                                         console.log('ошибка коммита');
//                                         //throw err;
//                                     });
//                                 }
//                                 //mysqldb.connection.end();
//                                 //console.log('success!');
//                             });
//                         }
//                     }); //третий инсерт
//                 }); //второй инсерт
//             }); //первый инсерт
//         }); //транзакция
//         connection.release();
//         if (err) {
//             throw error;
//         }
//     }) //pool.getConnection
// }


exports.insertCameraInMysql = function (result_oc_product, result_oc_product_description, result_oc_product_to_category, images, cb) {
    mysqldb.pool.getConnection(function (err, connection) {
            if(err){
                console.log("Ошибка при соединении"+err);
            }
            //Добавление первого запроса если ошибка то откат
            connection.query('INSERT INTO `oc_product` SET ?;SET @lastID := LAST_INSERT_ID();', result_oc_product, function (error, results, fields) {
                if (error) {
                    console.log('Ошибка в 1 запросе');
                }

                //Добавление второго запроса если ошибка то откат
                connection.query('INSERT INTO `oc_product_description` SET `product_id`= @lastID,?', result_oc_product_description, function (error, results, fields) {
                    if (error) {
                        console.dir(error);
                    }

                    //Добавление третьего запроса если ошибка то откат
                    connection.query('INSERT INTO `oc_product_to_category` SET `product_id`= @lastID,?;INSERT INTO `oc_product_to_category` VALUE(@lastID,"33");INSERT INTO `oc_product_to_store` VALUE(@lastID,"0");', result_oc_product_to_category, function (error, results, fields) {
                        if (error) {
                            console.dir(error);
                        }

                        //Динамическое формирование четвертого запроса
                        if (results && results != "") {
                            var query = 'INSERT INTO `oc_product_image` VALUE';
                            for (var url in images) {
                                query += '("", @lastID, "' + images[url] + '", "0"),';
                            }
                            query = query.slice(0, -1);

                            connection.query(query, function (error, results, fields) {
                                if (error) {
                                    console.log('Ошибка в последнем запросе');
                                }

                                connection.commit(function (err) {
                                    if (err) {
                                        return mysqldb.connection.rollback(function () {
                                            console.log('ошибка коммита');
                                            //throw err;
                                        });
                                    }
                                    log.step(0, 0, 1);
                                    //console.log('success!');
                                });

                            }); //четвертый инсерт
                        } else {
                            connection.commit(function (err) {
                                if (err) {
                                    console.log("Ошибка ухх"+err);
                                }
                            });
                        }
                    }); //третий инсерт
                }); //второй инсерт
            }); //первый инсер
        connection.release();
        if (err) {
            throw error;
        }
    }) //pool.getConnection
}