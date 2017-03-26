var log = require('cllc')();
var tress = require('tress');
var needle = require('needle');
var cheerio = require('cheerio');
var fs = require('fs');
var escape = require('escape-html');

var startURL = 'http://rozetka.com.ua/lenovo_ideapad_110_15ibr_80t7004tra/p12119220/';
var imageURL = '';

var httpOptions = {};
var result_oc_product_description = {
    "product_id": 1,
    "language_id": 1,
    "name": '',
    "description": '',
    "tag": '',
    "meta_title": '',
    "meta_desctiption": '',
    "meta_keyword": ''
};

var result_oc_product = {
    "product_id": '',//autoincrement
    "model": '',
    "sku": '',
    "upc": '',
    "ean": '',
    "jan": '',
    "isbn": '',
    "mpn": '',
    "location": '',
    "quantity": '990',
    "stock_status_id": '5',
    "image": '',
    "manufacturer_id": '',
    "shipping": 1,
    "price": 0,
    "points": 0,
    "tax_class_id": 0,
    "date_available": '2000-01-01',
    "weight": 0,
    "weight_class_id": 1,
    "length": 0,
    "width": 0,
    "height": 0,
    "length_class_id": 1,
    "substract": 1,
    "minimum": 0,
    "sort_order": 0,
    "status": 1,
    "viewed": 0,
    "date_added": '',
    "date_modified": ''
};

var result_oc_product_attribute ={
    "product_id": '',
    "attribute_id": '',
    "language_id": '',
    "text": ''
};

var result_oc_product_image = {
    "product_image_id": '',//autoincrement
    "product_id": '',
    "image": '',
    "sort_order": ''
};

var result_oc_product_option = {
    "product_option_id": '',//autoincrement
    "product_id": '',
    "option_id": '',
    "value": '',
    "required": ''
};

var result_oc_product_to_category = {
    "product_id": '',
    "category_id": ''
};

var result_oc_product_to_layout = {
    "product_id": '',
    "store_id": 0,
    "layout_id": 0
};

var result_oc_product_to_store = {
    "product_id": '',
    "store_id": 0
};

var results = [];
var $;
var a=0;
var i;

var q = tress(crawl);

q.push(startURL);

q.drain = function(){
    fs.writeFileSync('./data.json', JSON.stringify(result_oc_product_description, null, 4));
    log.finish();
    log('Работа закончена');
}

function crawl(url, callback){
    needle.get(url, function(err, res){
        if (err || res.statusCode !== 200) {
            log.e((err || res.statusCode) + ' - ' + url);
            return callback(true);
        }
        
        body = res.body.replace(new RegExp("<br>",'g')," \r\n");
        var $ = cheerio.load(body);
        //console.log($);
        result_oc_product_description.name = $('h1.detail-title').text();
        $('div#short_text.b-rich-text.text-description-content').each(function(){
            result_oc_product_description.description = $(this).text().replace(new RegExp(" \r\n",'g'),"<br>");
        });
        result_oc_product_description.meta_title = $('meta[property="og:title"]').attr('content');
        result_oc_product_description.meta_keyword = $('meta[name="keywords"]').attr('content');
        result_oc_product_description.meta_desctiption = $('meta[name="description"]')
            .attr('content')
            .replace(new RegExp("Rozetka.ua.",'g'),"opencart")
            .replace(new RegExp("537-02-22",'g'),"222-22-22")
            .replace(new RegExp("0 800 503-808",'g'),"0 800 222-222");
        
        result_oc_product.model = result_oc_product_description.meta_title.split(' ', 4).splice(0, 3).join(' ');
        imageFolder = "images\\" + result_oc_product.model.replace(new RegExp(" ", 'g'), '\\') + "\\";
        console.log(imageFolder);
        
        imageURL = $('meta[property="og:image"]').attr('content');
        try{
            fs.mkdirSync(imageFolder);
        }
        finally{
            //do something
        }
        
        needle.get(imageURL, { output: imageFolder+'111.jpg' }, function(err, resp, body){
          if(err) {
              log.e(err);
              return;
          }
        });
        
        console.log(result_oc_product_description);   
        callback();
    });
}