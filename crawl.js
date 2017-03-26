//https://habrahabr.ru/post/302766/
var log = require('cllc')();
var tress = require('tress');
var needle = require('needle');
var cheerio = require('cheerio');
var fs = require('fs');

//var sCookie = 'http://www.puntolis.it/storelocator/defaultsearch.aspx?idcustomer=111';
//var sProv = 'http://www.puntolis.it/storelocator/buildMenuProv.ashx?CodSer=111';
//var sLoc = 'http://www.puntolis.it/storelocator/buildMenuLoc.ashx?CodSer=111&ProvSel=%s';
//var sMarker = 'http://www.puntolis.it/storelocator/Result.aspx?provincia=%s&localita=%s&cap=XXXXX&Servizio=111';

var startURL = 'http://rozetka.com.ua/notebooks/c80004/filter/page=1/';
var categoriURL = 'http://rozetka.com.ua/notebooks/c80004/filter/page=';

var httpOptions = {};
var results = [];
var $;
var a=0;
var i;

var q = tress(crawl);
//var q = tress(scraping);

//q.success = function(){
//    q.concurrency = 1;
//}

//q.retry = function(){
//    q.concurrency = -10000;
//}

q.drain = function(){
    fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
    log.finish();
    log('Работа закончена');
}

 //получаем общее количество страниц
    needle.get(startURL, function(err, res){
        if (err || res.statusCode !== 200)
        throw err || res.statusCode;
        
        httpOptions.cookies = res.cookies;// получаем куки так на всякий случай
        //console.log(httpOptions);
        log('Начало работы');// с помощью cllc выводим сообщение в консоль
        log.start('Найдено страниц %s, Найдено товаров %s, Найдено маркеров %s.');// с помощью cllc выводим счетчики в консоль
        
        // здесь делаем парсинг страницы из res.body
        body = res.body;
        //console.log(body);
        $ = cheerio.load(body);
        //console.log($);
        $('a.novisited.paginator-catalog-l-link').each(function(){
            i = $(this).text();
        });
        //console.log(i);
        log.step(i);// выводим в индикацию общее количество страниц
        for(var c = 1; c <= i; c++){
            q.push(categoriURL+c+"/");
        };
    });

function crawl(url, callback){
    needle.get(url, httpOptions, function(err, res){
        if (err || res.statusCode !== 200) {
            q.concurrency === 1 && log.e((err || res.statusCode) + ' - ' + url);
            return callback(true);
        }
        
        var $ = cheerio.load(res.body);
        //console.log($);
        $('a.centering-child-img').each(function() {
            //console.log($(this).attr('href'));
            log.step(0, 1);
        });

        callback();
    });
}

//function scraping(url, callback){
//    
//}