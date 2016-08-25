angular.module('mol.controllers')
  .controller('molIndicatorsCtrl', ['$scope', 'molApi','countries','country',
    function($scope, molApi, countries, country) {
      $scope.model = {
        countries : countries,
        country : country };
    

}]);
