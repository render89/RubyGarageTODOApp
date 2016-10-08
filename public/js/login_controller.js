angular.module('myApp')
.controller('loginController', function($scope, $location, $http, $cookieStore){
	$scope.login = function(email, password){
		var data = {login: email, password: password};	 
		$http.post('/api/login', data)
				.then(function(response){
					$cookieStore.put('user', response.data);
					$location.path('/projects');
				})
				.catch(function(error){
					console.error(error);
					$scope.error = error;
				})
	}
});