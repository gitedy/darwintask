var app = angular.module('imgTask', ['ngRoute']);

app.config(function($routeProvider) {
	$routeProvider


		.when('/', {
			templateUrl : 'page1.html'
		})
		.when('/2', {
			templateUrl : 'page2.html'
		})
		.when('/3', {
			templateUrl : 'page3.html'
		})


});


app.directive('hideUntilGood', function() {
	return {
		restrict: 'A',
		multiElement: true,
		link: function(scope, element, attrs) {
			attrs.$observe('ngSrc', function (value) {
				// fix where ngSrc doesn't update when blank
				if (!value || value.length == 0) {
					element.attr('src', value);
				}
				element.css("display", "none");
			});
			element.bind('load', function() {
				element.css("display", "");
			});
		}
	};
})

app.directive('onError', function() {
	return {
		restrict:'A',
		link: function(scope, element, attr) {
			element.on('error', function() {
				element.attr('src', attr.onError);
			})
		}
	}
})

app.controller('pg1Ctrl',['$scope','$http','$window',function ($scope,$http,$window) {

	$scope.down=false;
	$scope.gray=false;
	$scope.comp=false;


	$scope.result=[];
	$scope.search='';

	$scope.searchMe=function () {
		$scope.down=true;

		$http.get('/api/find/?search_text='+$scope.search,{timeout:1000000})
			.success(function (result) {


					$scope.down=false;

					$window.alert("Processing completed || please click keyword hitory !");
					$scope.search='';

			})

	}

}]);


app.controller('pg2Ctrl',['$scope','$http',function ($scope,$http) {

	$scope.loading=true;
	// http://localhost:8080
	$scope.result=''

	$http.get('/api/list')
		.success(function (result) {
			$scope.loading=false;
$scope.result=result;
			console.log(result);

		})


}]);

app.controller('pg3Ctrl',['$scope','$http','$location',function ($scope,$http,$location) {

$scope.loading=true;
	$scope.show= $location.search().name;

	console.log($location.search().name);

	$scope.result=[];




	$http.get('/api/fetch?data='+$scope.show)
		.success(function (result) {
			console.log(result);


			$scope.loading=false;

			// var str= result[0].path[0].path;
			// var dtr= str.slice(6);
			// console.log(dtr);



			for(i=0;i<15;i++){
				var str= result[0].path[i];
				var dtr= str.slice(6);
				$scope.result.push(dtr);
			}
			console.log($scope.result);

		});


}]);
