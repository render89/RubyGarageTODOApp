angular.module('myApp')
.directive('tasksDirective', function($http){
	return{
		restrict: 'AE',
		link: function(scope){
			var date = scope.task.task_deadline && scope.task.task_deadline.split('.');
			if (date){
				var year = date[0];
				var month = date[1] - 1;
				var day = +date[2] + 1;
				scope.task.task_deadline = new Date(year,month,day)
			}
			scope.changeTaskName = function(task){
				task.nameEditable = true;
			};

			scope.saveTaskName = function(event, task){
				var data = {name: task.task_name, status: task.task_status}
				if(event.keyCode == 13){
					$http.put('/api/tasks/' +task.task_id, data)
						.then(function(updated_task){
							if(task.task_name == updated_task.data.name){
								console.log('Изменено');
								task.nameEditable = false;
							}
						})
						.catch(function(error){
							console.error(error);
					});
				}
			};
			scope.deleteTask = function(deleted_task){
			  	$http.delete('/api/tasks/' + deleted_task.task_id)  
					.then(function(){
						scope.project.tasks = scope.project.tasks.filter(function(task){
							return task.task_id !== deleted_task.task_id; // в массив все элементы в которых айди не равен тому который мы удалили
						});
					})
					.catch(function(error){
						console.error(error);
					});
			};	
			scope.$watch('task.task_status', function(value){
				var data = {
					name: scope.task.task_name, 
					status: value,
					priority: scope.task.task_priority,
					deadline: scope.task.task_deadline
				};
				$http.put('/api/tasks/' + scope.task.task_id, data)
					.then(function(updated_task){
						console.log('bezpoleznost')
					})
					.catch(function(error){
						console.error(error);
					});
			}, true);
			scope.changeTaskPriority = function(task){
				var data = {
					name: task.task_name,
					priority: !task.task_priority, // новое значение - value //знак восклицания - тру в фолс и наоборот
					status: task.task_status,
					deadline: task.task_deadline
				};
				$http.put('/api/tasks/' + scope.task.task_id, data)
					.then(function(response){
						var updated_task = response.data;
						task.task_priority = updated_task.task_priority;
					})
					.catch(function(error){
						console.error(error);
					});
			}
			scope.saveDeadlineTask = function(event, task){
				var data = {
					name: task.task_name,
					priority: task.task_priority,
					status: task.task_status,
					deadline: task.task_deadline
				}
				if(event.keyCode == 13){
					$http.put('/api/tasks/' + scope.task.task_id, data)
						.then(function(response){
							var save_deadline = response.data; 
						})
						.catch(function(error){
							console.error(error);
						});
				}
			}
		},
		scope:{
			task: '=taskOuter',
			project: '=projectOuter'
		},
		templateUrl: 'views/task.html'
	}
})