var express = require('express');
var mysql = require('mysql-promise')();
var dbconfig = require('./config.json');
var bodyParser = require('body-parser');
var app = express();
var api_task = require('./api/api_task');
var api_auth = require('./api/api_auth');
var api_project = require('./api/api_project');

mysql.configure(dbconfig);

app.use(function(req, res, next){
	console.log(req.method, req.url); // можно добавить new Date()
	next(); 
}); // логгер, который пишет в консоль все хттп запросы, которые получает наш сервер

app.use(bodyParser.json()); // смысл - функция которая парсит тело запроса (без него будет req.body андефайнд)

app.use(express.static(__dirname + '/public')); // срабатывают для каждого запроса (middleware) app.use - смысл раздаем фронтенд файлы (статику)

api_task(app);
api_auth(app);
api_project(app);

mysql.query('SELECT 1+1').then(function(){
	console.log('connected to database');
	app.listen(3000, function(){
		console.log('Listening on port 3000');
	});
}).catch(function(error){
	console.log('database connection error:', error);
});