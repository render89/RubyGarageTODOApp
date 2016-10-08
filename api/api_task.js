var mysql = require('mysql-promise')();
var sqlQueries = require('../sql_queries');
var _ = require('lodash');

module.exports = function(app){
	
	app.post('/api/tasks', function(req, res){
		var project_id = req.body.project_id;
		var new_name = req.body.name;
		mysql.query(sqlQueries.addTask, [new_name, project_id]).then(function(sql_response){
			var meta = sql_response[0]; // в инсерт запросах первый элемент мета, данных нет))) поэтому делаем еще один запрос селект
			mysql.query(sqlQueries.getTask + meta.insertId) // что такое инсерт айди
				.then(function(response){
					var task = response[0][0]; // данные - 1й элемент (это массив), 2ой мета
				// 0 от 0 это вложенный массив
					task.task_name = task.name;
					task.task_id = task.id;
					res.send(task);
				})
		});
	});

	app.put('/api/tasks/:id', function(req, res){
		var task_id = req.params.id;
		var new_name = req.body.name;
		var status = req.body.status;
		var priority = req.body.priority;
		var deadline = req.body.deadline;
		mysql.query(sqlQueries.updateTask, [new_name, status, priority, deadline, task_id]) 			
			.then(function(sql_response){ // вместо знаков вопросов подставляет значения из массива
				mysql.query(sqlQueries.getTask + task_id).then(function(sql_response2){
					var task = sql_response2[0][0];
					task.task_status = task.status;
					task.task_priority = task.priority;
					task.task_deadline = task.deadline;
					res.send(task);
				});
			});	
	});

	app.delete('/api/tasks/:id', function(req, res){
		var taskId = req.params.id;
		mysql.query(sqlQueries.deleteTask + taskId).then(function(sql_response){		
			res.sendStatus(200);
		});
	});

};