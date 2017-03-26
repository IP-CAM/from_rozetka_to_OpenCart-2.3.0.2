var express = require('express'); // подключение фреймворка express
var bodyParser = require('body-parser');//подключение библиотеки получения пост
var tress = require('tress');// Простая в использовании асинхронная очередь заданий
var needle = require('needle');// Самый маленький и самый красивый клиент HTTP
var cheerio = require('cheerio');//jQuery для node.js
var log = require('cllc')();//библиотека для вывода сообщений в консоль
                                //nodemon библиотека для автоматического перезапуска сервера при изменении файлов
                                //mysql Библиотека для работы с бд
var fs = require('fs');//работа с файлами
var escape = require('escape-html');//Используется для кодирования / экранирования спецсимволов
var shell = require('shelljs'); //для запуска шел скриптов под нодой



