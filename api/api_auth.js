var mysql = require('mysql-promise')();
var sqlQueries = require('../sql_queries');
var _ = require('lodash');

module.exports = function(app){

	app.post('/api/login', function(req, res){
		var login = req.body.login;
		var password = req.body.password;	
		mysql.query(sqlQueries.login, [login, password]).then(function(sql_response){
			var response = sql_response[0];
			if (response.length == 1){
				res.send(200, response[0]);
			}else{
				res.send(404, 'Логин и пароль введены не верно');
			}
		});
	});

	app.post('/api/registration', function(req, res){
		var info = req.body;	
		mysql.query(sqlQueries.addUser, [
		   info.login, 
		   info.password, 
		   info.lastname, 
		   info.firstname,
		   info.date,
		   info.sex
		]).then(function(sql_response){
			var response = sql_response[0];
			res.send('user has been successfully registered');
		})
		.catch(function(error){
			console.log(error);
			res.send(500, error);
		})	
	});
	
};