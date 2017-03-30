var log = require('cllc')();//библиотека для вывода сообщений в консоль
var tress = require('tress');// Простая в использовании асинхронная очередь заданий
var needle = require('needle');// Самый маленький и самый красивый клиент HTTP
var cheerio = require('cheerio');//jQuery для node.js
var fs = require('fs');//работа с файлами
var escape = require('escape-html');//Используется для кодирования / экранирования спецсимволов
var shell = require('shelljs');//для запуска шел скриптов под нодой

var CreateNewProduct = require('./models/model');// транзакция добавления товара в opencart

var startURL = 'http://rozetka.com.ua/notebooks/c80004/filter/page=1/';
var categoriURL = 'http://rozetka.com.ua/notebooks/c80004/filter/page=';

var q = tress(crawl, 10); // создание новой очереди заданий для функции crawl, второй ппараметр это количество одновременных потоков

//получаем общее количество страниц
needle.get(startURL, function (err, res) {
    if (err || res.statusCode !== 200)
        throw err || res.statusCode;

    var i;
    var httpOptions = {};
    
    httpOptions.cookies = res.cookies; // получаем куки так на всякий случай
    log('Начало работы'); // с помощью cllc выводим сообщение в консоль
    log.start('Найдено страниц %s, Найдено товаров %s, Добавлено товаров в базу данных %s.'); // с помощью cllc выводим счетчики в консоль

    // здесь делаем парсинг страницы из res.body
    body = res.body;
    $ = cheerio.load(body);
    $('a.novisited.paginator-catalog-l-link').each(function () {
        i = $(this).text();
    });
    log.step(i); // выводим в индикацию общее количество страниц
    for (var c = 1; c <= i; c++) {
        q.push(categoriURL + c + "/");//добавляем адресса в очередь на обработку
    };
});

// парсинг адресов товаров и добавление результатов в базу данных
function crawl(url, callback) {
    needle.get(url, function (err, res) {
        if (err || res.statusCode !== 200) {
            log.e((err || res.statusCode) + ' - ' + url);
            return callback(true);// возвращаем url в начало очереди
        }

        var imageURL = '';
        var temp;
        var $;//временная переменная для cheerio

        //одноименная таблица в базе данных
        var result_oc_product_description = {
            "language_id": 1,
            "name": '',
            "description": '',
            "tag": '',
            "meta_title": '',
            "meta_description": '',
            "meta_keyword": ''
        };

        //одноименная таблица в базе данных
        // первый элемент product_id находится в запросе на добаление в таблицу в модели
        var result_oc_product = {
            "product_id": '', //autoincrement
            "model": '',
            "sku": '',
            "upc": '',
            "ean": '',
            "jan": '',
            "isbn": '',
            "mpn": '',
            "location": '',
            "quantity": '990',
            "stock_status_id": 5,
            "image": '123',
            "manufacturer_id": '',
            "shipping": 1,
            "price": '',
            "points": 0,
            "tax_class_id": 9,
            "date_available": '2017-01-01',
            "weight": 0,
            "weight_class_id": 1,
            "length": 0,
            "width": 0,
            "height": 0,
            "length_class_id": 1,
            "subtract": 1,
            "minimum": 0,
            "sort_order": 0,
            "status": 1,
            "viewed": 2,
            "date_added": '',
            "date_modified": ''
        };

        //одноименная таблица в базе данных
        // первый элемент product_id находится в запросе на добаление в таблицу в модели
        var result_oc_product_to_category = {
            "category_id": 18
        };

        // делаем парсинг страници из res.body
        var $ = cheerio.load(res.body);
        //находим адресса товаров и добавляем их в чердь
        $('a.centering-child-img').each(function () {
            q.push($(this).attr('href'));
            log.step(0, 1);
        });

        result_oc_product_description.name = $('h1.detail-title').text();// получение имени товара
        $('div#short_text.b-rich-text.text-description-content').each(function () {
            result_oc_product_description.description = $(this).text();
        });// получение описания товара
        result_oc_product_description.meta_title = $('meta[property="og:title"]').attr('content');// meta_title
        result_oc_product_description.meta_keyword = $('meta[name="keywords"]').attr('content');// meta_keyword
        result_oc_product_description.meta_description = $('meta[name="description"]')
            .attr('content')
            .replace(new RegExp("Rozetka.ua.", 'g'), "opencart")
            .replace(new RegExp("537-02-22", 'g'), "222-22-22")
            .replace(new RegExp("0 800 503-808", 'g'), "0 800 222-222");// meta_description

        // сомнительный блок проверяет есть ли метаописание и содержит ли оно более четырех слов... если нет то товар пропускается
        // из meta_title получаются имена файлов и бренд производителя
        // нужно переписать
        if (result_oc_product_description.meta_title && result_oc_product_description.meta_title.split(' ', 4).splice(0, 3).join(' ')) {
            result_oc_product.model = result_oc_product_description.meta_title.split(' ', 4).splice(0, 3).join(' ');// получение модели
            imageFolder = "images\\" + result_oc_product.model.replace(new RegExp(" ", 'g'), '\\').replace(new RegExp("\"", 'g'), '') + "\\";// получение path к фото товара
            //shell.mkdir('-p', imageFolder); //создание path для фото товара если его нет

            imageURL = $('meta[property="og:image"]').attr('content');// ссылка на основное фото
            imageName = imageURL.split('/').pop();// имя основного фото

            // выбор кода производителя по системе OpenCart
            temp = result_oc_product.model.split(' ').shift();
            switch (temp) {
                case "Lenovo":
                    result_oc_product.manufacturer_id = 11;
                    break;
                case "Acer":
                    result_oc_product.manufacturer_id = 13;
                    break;
                case "Apple":
                    result_oc_product.manufacturer_id = 8;
                    break;
                case "Asus":
                    result_oc_product.manufacturer_id = 12;
                    break;
                case "Dell":
                    result_oc_product.manufacturer_id = 15;
                    break;
                case "GoClever":
                    result_oc_product.manufacturer_id = 14;
                    break;
                case "HP":
                    result_oc_product.manufacturer_id = 7;
                    break;
                case "MSI":
                    result_oc_product.manufacturer_id = 16;
                    break;
                case "Prestigio":
                    result_oc_product.manufacturer_id = 17;
                    break;
                case "Razer":
                    result_oc_product.manufacturer_id = 18;
                    break;
                case "Xiaomi":
                    result_oc_product.manufacturer_id = 19;
                    break;
                default:
                    log('noname manufacturer');
                    break;
            }
            
            result_oc_product.price = $('meta[itemprop="price"]').attr('content');// получение цены
            
//            if (!result_oc_product.price) {
//                result_oc_product.price = '';
//            }// если цена отсутствует добавление пустой стороки
            
            // получение текущей даты в нужном формате
            temp = new Date();
            result_oc_product.date_added = result_oc_product.date_modified = temp.getFullYear() + "." + ((temp.getMonth() + 1) > 9 ? (temp.getMonth() + 1) : "0" + (temp.getMonth() + 1)) + "." + ((temp.getDate() + 1) > 9 ? (temp.getDate() + 1) : "0" + (temp.getDate() + 1)) + " " + ((temp.getHours() + 1) > 9 ? (temp.getHours() + 1) : "0" + (temp.getHours() + 1)) + ":" + ((temp.getMinutes() + 1) > 9 ? (temp.getMinutes() + 1) : "0" + (temp.getMinutes() + 1)) + ":" + ((temp.getSeconds() + 1) > 9 ? (temp.getSeconds() + 1) : "0" + (temp.getSeconds() + 1));

            //needle.get(imageURL).pipe(fs.createWriteStream(imageFolder + imageName));// скачиване фото по адрессу imageFolder + imageName
            result_oc_product.image = "catalog\\" + imageFolder + imageName;// получение ссылки на фото на сервере
            result_oc_product.image = result_oc_product.image.replace(/\\/gi, "/");

            var images = [];// массив для добавления неосновных фото
            $('div.detail-img-thumbs-l-i>a').each(function () {
                var imageURL = $(this).attr('href');// получение адресса фото
                var imageName = imageURL.split('/').pop();// выделение имени файла
                //needle.get(imageURL).pipe(fs.createWriteStream(imageFolder + imageName));// скачивание файла в каталог
                var imagePath = "catalog\\" + imageFolder + imageName;// составление пути в файлу на сервере
                images.push(imagePath.replace(/\\/gi, "/"));// добавление пути в массив с остальными фото для отправки в бд
            });

            var characteristicsURL = url + '#tab=characteristics';// формируем адресс с характеристиками товара
            needle.get(characteristicsURL, function (err, res) {
                if (err || res.statusCode !== 200) {
                    log.e((err || res.statusCode) + ' - ' + url);
                    return callback(true);
                }
                var $$ = cheerio.load(res.body);
                var chtml = $$('section[name="characteristics"]>dl').html();// парсинг характеристик
                // формирование характеристик отделяющая черта=>заглавие=>характеристики
                result_oc_product_description.description += '<hr><h2>Технические характеристики ' + result_oc_product.model + '</h2><br>' + chtml;

                //Отправка всего этого добра на запись в базу данных
                CreateNewProduct.insertProductInMysql(result_oc_product, result_oc_product_description, result_oc_product_to_category, images, function (error, results) {
                    if (error) {
                        log.error('Ошибка записи в базу!');
                        console.log(error);
                    }
                })
            });
        }
        
        //Разработчику все эти задачи представлены в виде четырёх массивов, доступных по свойствам q.waiting, q.active, q.finished и q.failed
        //Если колбэк вызван без параметров или если первый параметр null – задача признаётся выполненной и помещается в массив finished.
        //Если первый параметр колбэка имеет тип boolean, то задача возвращается на повторную обработку и ставится в начало очереди (начало массива waiting), если параметр равен true, или в конец очереди (конец массива waiting), если параметр равен false.
        //Если первый параметр колбэка – объект ошибки (instanceof Error), то задача перемещается в массив failed.
        //При любых других значениях первого параметра колбэка поведение модуля не определено и может меняться в последующих версиях (так что лучше не надо).
        callback();
    });
}

//запуск 
//q.push(startURL);

// когда закончатся задачи в очереди выполнится блок
q.drain = function () {
    //fs.writeFileSync('./data.json', JSON.stringify(result_oc_product_description, null, 4));
    log.finish();
    log('Работа закончена');
}