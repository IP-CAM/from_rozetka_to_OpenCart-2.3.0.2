var CreateNewProduct = require('../models/model');

CreateNewProduct.createInMysql(bashPost, function (error, results) {
    log.step(0, 0, 1); // Увеличить третий счётчик на 1.
    if (error) {
        log.error('Ошибка записи в базу!');
        console.log(error);
    }
})
