angular.module('myApp') 
.controller('projectsListController', function($scope, $http, $cookieStore, $location){
	$scope.projectList = [];
	$scope.outSession = function(){
		$cookieStore.remove('userId');
		$location.path('/');
	};	
	$scope.userInfo = $cookieStore.get('user');
	var data = {
		params: {
			userId: $cookieStore.get('user').id
		}
	}
	$http.get('/api/projects', data)
		.then(function(project_list){
			if(Array.isArray(project_list.data)){ // проверка на массив
			// проверка на обьект - typeof project_list === 'object'; -string -number
				$scope.projectList = project_list.data;  // присваиваем проекты, которые пришли с сервера
			}
		})
		.catch(function(error){
			console.error(error);
		});
	$scope.addProject = function(){
		var cookies = $cookieStore.get('user').id;
		$http.post('/api/projects', {userId: cookies}) // урл всегда один, в путе и делите + ид
			.then(function(project){
				$scope.projectList.push(project.data); // добавляем новый проект
			})
			.catch(function(error){
				console.error(error);
			})
		};
	$scope.deleteProject = function(project){
		$http.delete('/api/projects/' + project.id) // передали проджект из вьюхи, не обязательно проджект любое название, 
			.then(function(){
				$scope.projectList = $scope.projectList.filter(function(proj){
					return proj.id !== project.id; // proj - шопопаломб, вторая строка - в массив все элементы в которых айди не равен тому который мы удалили
				});
			})
			.catch(function(error){
				console.error(error);
			});
	};
})