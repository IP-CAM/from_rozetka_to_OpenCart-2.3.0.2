var mysqldb = require('./mysqldb');

exports.createInMysql = function (bashPost, cb) {
    mysqldb.connection.query('INSERT INTO `bash` SET ?', bashPost, function (error, results, fields) {
        cb(error, results);
    });
}

exports.insertProductInMysql = function (result_oc_product, result_oc_product_description, result_oc_product_to_category, images, cb) {
    mysqldb.connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }
        mysqldb.connection.query('INSERT INTO `oc_product` SET ?', result_oc_product, function (error, results, fields) {
            if (error) {
                return mysqldb.connection.rollback(function () {
                    throw error;
                });
            }

            result_oc_product_description.product_id = results.insertId;
            result_oc_product_to_category.product_id = results.insertId;

            mysqldb.connection.query('INSERT INTO `oc_product_description` SET ?', result_oc_product_description, function (error, results, fields) {
                if (error) {
                    return mysqldb.connection.rollback(function () {
                        throw error;
                    });
                }

                mysqldb.connection.query('INSERT INTO `oc_product_to_category` SET ?', result_oc_product_to_category, function (error, results, fields) {
                    if (error) {
                        return mysqldb.connection.rollback(function () {
                            throw error;
                        });
                    }

                    if(results && results != ""){
                        var query = 'INSERT INTO `oc_product_image` VALUE';
                        for(var url in images){
                            query += '("", "'+result_oc_product_description.product_id+'", "'+images[url]+'", "0"),';
                        }
                        query = query.slice(0, -1);

                        mysqldb.connection.query(query, function (error, results, fields) {
                            if (error) {
                                return mysqldb.connection.rollback(function () {
                                    throw error;
                                });
                            }

                            mysqldb.connection.commit(function (err) {
                                if (err) {
                                    return mysqldb.connection.rollback(function () {
                                        throw err;
                                    });
                                }
                                mysqldb.connection.destroy();
                                console.log('success!');
                            });

                        }); //четвертый инсерт
                    } else {
                        mysqldb.connection.commit(function (err) {
                                if (err) {
                                    return mysqldb.connection.rollback(function () {
                                        throw err;
                                    });
                                }
                                mysqldb.connection.destroy();
                                console.log('success!');
                            });
                    }
                }); //третий инсерт
            }); //второй инсерт
        }); //первый инсерт
    });
}