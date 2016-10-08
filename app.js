var express = require('express');
var mysql = require('mysql-promise')();
var _ = require('lodash');
var dbconfig = require('./config.json');
var bodyParser = require('body-parser');
var sqlQueries = require('./sql_queries');
mysql.configure(dbconfig);
var app = express();
app.use(function(req, res, next){
	console.log(req.method, req.url); // можно добавить new Date()
	next(); 
}); // логгер, который пишет в консоль все хттп запросы, которые получает наш сервер
app.use(bodyParser.json()); // смысл - функция которая парсит тело запроса (без него будет req.body андефайнд)
app.use(express.static(__dirname + '/public')); // срабатывают для каждого запроса (middleware) app.use - смысл раздаем фронтенд файлы (статику)
app.get('/api/projects', function(req, res){ 
	var userId = req.query.userId;
	// отдаем все проекты со всеми задачами
	// структура данных - 
	// массив проектов
	// у каждого проекта есть массив tasks
	// аналогично файлу tasks.json
	mysql.query(sqlQueries.getProjectsList, [userId]).then(function(sql_response){ // запрос на скл (асинхронный - промис)
		// преобразование структуры данных ->
		// из массива задач делаем массив проектов
		// с вложенными задачами			
		var tasks = sql_response[0];  //первый элемент из массива сами данные, а 2ой элемент мета-инфа из базы данных.		
			// группируем по ID проекта, получаем обьект: {1: [tasks of project with ID = 1], 2: [tasks for project 2], 3: [tasks for project 3]}
		var groupedTasks = _.groupBy(tasks, 'project_id');			
			// вместо айдишников собираем обьект проекта с массивом вложенных tasks
		var projects = _.map(groupedTasks, function(tasks, project_id) { 	
			return {
					id: project_id,
					name: tasks[0].project_name,
					tasks: tasks.filter(function(task){ // отфильтровали, возвращаем таски только с айдишником, из-за корявого дЖоина
						return task.task_id;
					}).map(function(task){ // мап - новый массив (массив из массива)
						task.task_status = !!task.task_status; // преобразование в булеан
						return task;
					}).map(function(task){ // для приоритетов
						task.task_priority = !!task.task_priority;
						return task;
					})
			};
		});		
			// отправляем ответ
		res.send(projects);
	});
//	mysql.query('SELECT * from `PROJECT`').spread(function(projects, meta){
//		res.send(projects);
//	});	
});
app.post('/api/projects', function(req, res){
	var user_id = req.body.userId;
	mysql.query(sqlQueries.addProject, [user_id]).then(function(sql_response){
		var meta = sql_response[0]; // в инсерт запросах первый элемент мета, данных нет))) поэтому делаем еще один запрос селект
		mysql.query(sqlQueries.getProjectById + meta.insertId)
			.then(function(response){
				var project = response[0][0]; // данные - 1й элемент (это массив), 2ой мета
			// 0 от 0 это вложенный массив
				res.send(project);
			})
	})
			.catch(function(error){
				console.log(error);
				res.send(500, error);
			})
});
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
app.delete('/api/projects/:id', function(req, res){
	var projectId = req.params.id;
	mysql.query(sqlQueries.deleteProjectsById + projectId).then(function(sql_response){
		res.sendStatus(200);
	});
});
app.delete('/api/tasks/:id', function(req, res){
	var taskId = req.params.id;
	mysql.query(sqlQueries.deleteTask + taskId).then(function(sql_response){		
		res.sendStatus(200);
	});
});
app.put('/api/projects/:id', function(req, res){
	var project_id = req.params.id;
	var new_name = req.body.name;
	mysql.query(sqlQueries.updateProjectById, [new_name, project_id]).then(function(sql_response){ // вместо знаков вопросов подставляет значения из массива
		mysql.query(sqlQueries.getProjectById + project_id).then(function(sql_response2){
			res.send(sql_response2[0][0]);
		});
	});	
});
app.put('/api/tasks/:id', function(req, res){
	var task_id = req.params.id;
	var new_name = req.body.name;
	var status = req.body.status;
	var priority = req.body.priority;
	mysql.query(sqlQueries.updateTask, [new_name, status, priority, task_id]).then(function(sql_response){ // вместо знаков вопросов подставляет значения из массива
		mysql.query(sqlQueries.getTask + task_id).then(function(sql_response2){
			var task = sql_response2[0][0];
			task.task_status = task.status;
			task.task_priority = task.priority;
			res.send(task);
		});
	});	
});
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
// app.get('/api/projects/:project_id', function(req, res){ ---забрать не все а один проект
		// отдаем один проект по ID (project_id)
		// и к нему прикреплены все задачи
		// SQL: getProjectByIdWithTasks
// });
mysql.query('SELECT 1+1').then(function(){
		console.log('connected to database');
		app.listen(3000, function(){
			console.log('Listening on port 3000');
		});
})
		.catch(function(error){
		console.log('database connection error:', error);
		});