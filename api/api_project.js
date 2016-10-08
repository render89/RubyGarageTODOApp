var mysql = require('mysql-promise')();
var sqlQueries = require('../sql_queries');
var _ = require('lodash');

module.exports = function(app){

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

	app.put('/api/projects/:id', function(req, res){
		var project_id = req.params.id;
		var new_name = req.body.name;
		mysql.query(sqlQueries.updateProjectById, [new_name, project_id]).then(function(sql_response){ // вместо знаков вопросов подставляет значения из массива
			mysql.query(sqlQueries.getProjectById + project_id).then(function(sql_response2){
				res.send(sql_response2[0][0]);
			});
		});	
	});

	app.delete('/api/projects/:id', function(req, res){
		var projectId = req.params.id;
		mysql.query(sqlQueries.deleteProjectsById + projectId).then(function(sql_response){
			res.sendStatus(200);
		});
	});
	
};
// app.get('/api/projects/:project_id', function(req, res){ ---забрать не все а один проект
		// отдаем один проект по ID (project_id)
		// и к нему прикреплены все задачи
		// SQL: getProjectByIdWithTasks
// });