angular.module('myApp')
.controller('registrationController', function($scope, $http, $location){
   $scope.sendFormRegistration = function(registrationForm){
		var valid = validate(registrationForm);
		if (valid.isValid === false){
			// тоже самое ---> !valid.isValid
			$scope.error = valid.error;
			return;
		}
		$scope.error = null;
		var data = registrationForm;
		$http.post('/api/registration', data)
			.then(function(response){
				console.log(response);
				$scope.success = response.data;
			})
			.catch(function(error){
				console.error(error);
				$scope.error = error.data;
			})
   }
   $scope.backToLogin = function(){
		$location.path('/');
   }
});
function validate(form){
	var loginRegExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	var passwordRegExp = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
	var nameRegExp = /^[a-zA-Z]+$/;
	if (form.password && form.password.length < 8){
		return {isValid: false, error: 'Пароль должен содержать не менее 8 символов!'};
	}
	if (form.password !== form.confirmpassword){
		return {isValid: false, error: 'Пароли не совпадают!'};
	}
	if (form.password && !form.password.match(passwordRegExp)){
		return {isValid: false, error: 'Пароль должен содержать спецсимвол,латинскую букву и цифру'};
	}
	if (form.login && !form.login.match(loginRegExp)){
		return {isValid: false, error: 'Логин должен быть E-mail!'};
	}
	if (form.firstname && form.firstname.length < 2){
		return {isValid: false, error: 'Имя не должно содержать менее 2 букв!'}
	}
	if (form.firstname && !form.firstname.match(nameRegExp)){
		return {isValid: false, error: 'Имя должно содержать только буквы!'}
	}
	if (form.lastname && form.lastname.length < 2){
		return {isValid: false, error: 'Фамилия не должна содержать менее 2 букв!'}
	}
	if (form.firstname && !form.lastname.match(nameRegExp)){
		return {isValid: false, error: 'Фамилия должна содержать только буквы!'}	
	}	
	return {isValid: true}
};