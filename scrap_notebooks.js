var log = require('cllc')();
var tress = require('tress');
var needle = require('needle');
var cheerio = require('cheerio');
var fs = require('fs');
var escape = require('escape-html');
var shell = require('shelljs');

var CreateNewProduct = require('./models/model');

var startURL = 'http://rozetka.com.ua/notebooks/c80004/filter/page=1/';
var categoriURL = 'http://rozetka.com.ua/notebooks/c80004/filter/page=';
//var a = 0;

var q = tress(crawl, 10);

//получаем общее количество страниц
needle.get(startURL, function (err, res) {
    if (err || res.statusCode !== 200)
        throw err || res.statusCode;

    var i;
    var httpOptions = {};
    
    httpOptions.cookies = res.cookies; // получаем куки так на всякий случай
    //console.log(httpOptions);
    log('Начало работы'); // с помощью cllc выводим сообщение в консоль
    log.start('Найдено страниц %s, Найдено товаров %s, Добавлено товаров в базу данных %s.'); // с помощью cllc выводим счетчики в консоль

    // здесь делаем парсинг страницы из res.body
    body = res.body;
    //console.log(body);
    $ = cheerio.load(body);
    //console.log($);
    $('a.novisited.paginator-catalog-l-link').each(function () {
        i = $(this).text();
    });
    //console.log(i);
    log.step(i); // выводим в индикацию общее количество страниц
    for (var c = 1; c <= i; c++) {
        q.push(categoriURL + c + "/");
        //console.log(categoriURL + c + "/");
    };
});


function crawl(url, callback) {
    needle.get(url, function (err, res) {
        if (err || res.statusCode !== 200) {
            log.e((err || res.statusCode) + ' - ' + url);
            return callback(true);
        }

        var imageURL = '';
        var temp;
        var $;

        var result_oc_product_description = {
            "language_id": 1,
            "name": '',
            "description": '',
            "tag": '',
            "meta_title": '',
            "meta_description": '',
            "meta_keyword": ''
        };

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
            "price": 0,
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

        var result_oc_product_to_category = {
            "category_id": 18
        };

        var result_oc_product_to_store = {
            "product_id": '',
            "store_id": 0
        };

        var result_oc_product_image = {
            "product_image_id": '', //autoincrement
            "product_id": '11111111111',
            "image": '/1111111111/11111111111',
            "sort_order": 0
        };

        //console.log(url);
        //body = res.body.replace(new RegExp("<br>", 'g'), " \r\n");
        var $ = cheerio.load(res.body);

        $('a.centering-child-img').each(function () {
            q.push($(this).attr('href'));
            log.step(0, 1);
        });

        result_oc_product_description.name = $('h1.detail-title').text();
        $('div#short_text.b-rich-text.text-description-content').each(function () {
            result_oc_product_description.description = $(this).text();
        });
        result_oc_product_description.meta_title = $('meta[property="og:title"]').attr('content');
        result_oc_product_description.meta_keyword = $('meta[name="keywords"]').attr('content');
        result_oc_product_description.meta_description = $('meta[name="description"]')
            .attr('content')
            .replace(new RegExp("Rozetka.ua.", 'g'), "opencart")
            .replace(new RegExp("537-02-22", 'g'), "222-22-22")
            .replace(new RegExp("0 800 503-808", 'g'), "0 800 222-222");

        if (result_oc_product_description.meta_title && result_oc_product_description.meta_title.split(' ', 4).splice(0, 3).join(' ')) {
            result_oc_product.model = result_oc_product_description.meta_title.split(' ', 4).splice(0, 3).join(' ');
            imageFolder = "images\\" + result_oc_product.model.replace(new RegExp(" ", 'g'), '\\').replace(new RegExp("\"", 'g'), '') + "\\";
            //shell.mkdir('-p', imageFolder);

            imageURL = $('meta[property="og:image"]').attr('content');
            imageName = imageURL.split('/').pop();

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
            result_oc_product.price = $('meta[itemprop="price"]').attr('content');
            if (!result_oc_product.price) {
                result_oc_product.price = '';
            }
            temp = new Date();
            result_oc_product.date_added = result_oc_product.date_modified = temp.getFullYear() + "." + ((temp.getMonth() + 1) > 9 ? (temp.getMonth() + 1) : "0" + (temp.getMonth() + 1)) + "." + ((temp.getDate() + 1) > 9 ? (temp.getDate() + 1) : "0" + (temp.getDate() + 1)) + " " + ((temp.getHours() + 1) > 9 ? (temp.getHours() + 1) : "0" + (temp.getHours() + 1)) + ":" + ((temp.getMinutes() + 1) > 9 ? (temp.getMinutes() + 1) : "0" + (temp.getMinutes() + 1)) + ":" + ((temp.getSeconds() + 1) > 9 ? (temp.getSeconds() + 1) : "0" + (temp.getSeconds() + 1));

            //needle.get(imageURL).pipe(fs.createWriteStream(imageFolder + imageName));
            result_oc_product.image = "catalog\\" + imageFolder + imageName;
            result_oc_product.image = result_oc_product.image.replace(/\\/gi, "/");

            var images = [];
            $('div.detail-img-thumbs-l-i>a').each(function () {
                var imageURL = $(this).attr('href');
                var imageName = imageURL.split('/').pop();
                //needle.get(imageURL).pipe(fs.createWriteStream(imageFolder + imageName));
                var imagePath = "catalog\\" + imageFolder + imageName;
                images.push(imagePath.replace(/\\/gi, "/"));
            });

            var characteristicsURL = url + '#tab=characteristics';
            needle.get(characteristicsURL, function (err, res) {
                if (err || res.statusCode !== 200) {
                    log.e((err || res.statusCode) + ' - ' + url);
                    return callback(true);
                }
                var $$ = cheerio.load(res.body);
                var chtml = $$('section[name="characteristics"]>dl').html();
                result_oc_product_description.description += '<hr><h2>Технические характеристики ' + result_oc_product.model + '</h2><br>' + chtml;

                CreateNewProduct.insertProductInMysql(result_oc_product, result_oc_product_description, result_oc_product_to_category, images, function (error, results) {
                    if (error) {
                        log.error('Ошибка записи в базу!');
                        console.log(error);
                    }
                    if (results) {
                        console.log(results);
                    }
                })
            });
        }
        callback();
    });
}

//q.push(startURL);

q.drain = function () {
    //fs.writeFileSync('./data.json', JSON.stringify(result_oc_product_description, null, 4));
    log.finish();
    log('Работа закончена');
}