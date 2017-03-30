var mysqldb = require('./mysqldb');
var log = require('cllc')();

exports.insertProductInMysql = function (result_oc_product, result_oc_product_description, result_oc_product_to_category, images, cb) {
    //mysqldb.connection.connect();
    mysqldb.connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }
        mysqldb.connection.query('INSERT INTO `oc_product` SET ?;SET @lastID := LAST_INSERT_ID();', result_oc_product, function (error, results, fields) {
            if (error) {
                console.log(result_oc_product);
                return mysqldb.connection.rollback(function () {
                    //throw error;
                });
            }

//            result_oc_product_description.product_id = results.insertId;
//            result_oc_product_to_category.product_id = results.insertId;

            mysqldb.connection.query('REPLACE INTO `oc_product_description` SET `product_id`= @lastID,?', result_oc_product_description, function (error, results, fields) {
                if (error) {
                    //console.log(result_oc_product_description);
                    return mysqldb.connection.rollback(function () {
                        //throw error;
                    });
                }

                mysqldb.connection.query('REPLACE INTO `oc_product_to_category` SET `product_id`= @lastID,?;REPLACE INTO `oc_product_to_store` VALUE(@lastID,"0");', result_oc_product_to_category, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        return mysqldb.connection.rollback(function () {
                            //throw error;
                        });
                    }

                    if(results && results != ""){
                        var query = 'REPLACE INTO `oc_product_image` VALUE';
                        for(var url in images){
                            query += '("", @lastID, "'+images[url]+'", "0"),';
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