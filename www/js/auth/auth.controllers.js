angular.module('your_app_name.auth.controllers', [])


.controller('WelcomeCtrl', function($scope, $state, $ionicModal){
	$scope.bgs = ["img/welcome-bg.jpg"];

	$scope.facebookSignIn = function(){
		console.log("doing facebook sign in");
		$state.go('app.feed');
	};

	$ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.privacy_policy_modal = modal;
  });

	$ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.terms_of_service_modal = modal;
  });

  $scope.showPrivacyPolicy = function() {
    $scope.privacy_policy_modal.show();
  };

	$scope.showTerms = function() {
    $scope.terms_of_service_modal.show();
  };
})

.controller('CreateAccountCtrl', function($scope, $state, $http, localStorageService){
  $scope.form = {};

	$scope.doSignUp = function(){

    $http({
      method: 'POST',
      url: servidor + "registro.php",
      data: "nombre="+$scope.form.nombre+"&correo="+$scope.form.correo+"&celular="+$scope.form.celular+"&contrasena="+$scope.form.contrasena,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (response) {

      if (response[0].status == 1){
        // guardamos cookies
        $state.go('app.feed');
      } else {
        $scope.error = response[0].error;  
      }
        
    }).error(function (err, status) {
        
    });

	};
})

.controller('WelcomeBackCtrl', function($scope, $state, $ionicModal, $http, localStorageService){
  $scope.form = {};

	$scope.doLogIn = function(){
		
    $http({
      method: 'POST',
      url: servidor + "inicio.php",
      data: "usuario="+$scope.form.correo+"&contrasena="+$scope.form.contrasena,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (response) {

      if (response[0].status == 1){
        localStorageService.set('datos', { idusuario: response[0].idusuario, nombre: response[0].nombre, correo: response[0].correo  });
        $state.go('app.feed');
      } else {
        $scope.form.contrasena = "";
        $scope.error = response[0].error;  
      }
        
    });

	};

	$ionicModal.fromTemplateUrl('views/auth/forgot-password.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.forgot_password_modal = modal;
  });

  $scope.showForgotPassword = function() {
    $scope.forgot_password_modal.show();
  };

	$scope.requestNewPassword = function() {
    console.log("requesting new password");
  };

  // //Cleanup the modal when we're done with it!
  // $scope.$on('$destroy', function() {
  //   $scope.modal.remove();
  // });
  // // Execute action on hide modal
  // $scope.$on('modal.hidden', function() {
  //   // Execute action
  // });
  // // Execute action on remove modal
  // $scope.$on('modal.removed', function() {
  //   // Execute action
  // });
})

.controller('ForgotPasswordCtrl', function($scope){

})

;
