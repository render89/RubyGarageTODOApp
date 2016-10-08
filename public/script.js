angular.module('myApp', ['ngRoute', 'ngCookies'])
	.config(function($routeProvider, $locationProvider){
		$routeProvider
		.when('/', {
			templateUrl: 'views/login.html',
			controller: 'loginController',
		})
		.when('/registration', {
			templateUrl: 'views/registration.html',
			controller: 'registrationController'
		})
		.when('/projects', {
			private: true,
			templateUrl: 'views/project-list.html',
			controller: 'projectsListController'
		})
	})
.controller('mainController', function($scope, $location, $routeParams, $rootScope, $cookieStore) {
	$rootScope.$on('$routeChangeStart', function (event, next) {
		var userAuthenticated = $cookieStore.get('user').id;
		if (!userAuthenticated && next.private){
			$rootScope.savedLocation = $location.url();
			$location.path('/');
		}
	});
		$scope.$location = $location;
		$scope.$routeParams = $routeParams;
})