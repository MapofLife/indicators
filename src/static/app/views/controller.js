angular.module('mol.controllers')
  .controller('molIndicatorsCtrl', ['$scope', '$state', '$rootScope', '$q', 'molApi', 'molUiMap', 'molRegionOverlay',
    function($scope, $state, $rootScope, $q, molApi, molUiMap, molRegionOverlay) {
      	$scope.model = {
      		map: new molUiMap(),
        	regionHover: undefined
		};

		$rootScope = $scope; // important for map
		$rootScope.$state = $state; // for view specific css targeting
		$scope.infowindowPromise = $q.defer();
}]);
