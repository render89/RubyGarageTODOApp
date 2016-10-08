angular.module('myApp') 
.directive('projectsDirective', function($http){ // $http - need, (angular)
	return {
		restrict: 'E',
		link: function(scope){
			scope.nameEditable = false;
			scope.changeProjectName = function(){
				scope.nameEditable = true;
			};
		scope.saveProjectName = function(event, project){
		var data = {name: project.name}
		if(event.keyCode == 13){
			$http.put('/api/projects/' +project.id, data)
			.then(function(updated_project){
				if(project.name == updated_project.data.name){
					console.log('Изменено');// project - во вьюхе, updated_project - нами придуманый из базы данных
					scope.nameEditable = false;
				}
			})
			.catch(function(error){
				console.error(error);
			});
		}
		};
		scope.addTask = function(newTaskName, projectId){ // из вьюхи передаем, название от фонаря
			var data = {name: newTaskName, project_id: projectId}
			$http.post('/api/tasks', data)
			.then(function(task){
				scope.project.tasks.push(task.data); // добавляем новый проект
				})
			.catch(function(error){
				console.error(error);
			})
		};
		},
		scope:{
			project: "=projectOuter",
			deleteProject:  "=projectDelete",
		},
		templateUrl: 'views/project.html'
	};
});