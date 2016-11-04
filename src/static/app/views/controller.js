angular.module('mol.controllers')
  .controller('molIndicatorsCtrl', [
    '$scope', '$state', '$rootScope', 'molUiMap', '$timeout', '$q',
    function($scope, $state, $rootScope, molUiMap, $timeout, $q) {
      
      // set the page title
      $rootScope.pagetitle = $state.current.title;

      $scope.model = {
        map: new molUiMap(),
        regionHover: undefined,
        alerts: [],
        devmode: false
      };

      $scope.model.map.options.minZoom = 2;

      $scope.$watch('model.selectedMapTaxa', function(n, o) {
        //try{google.maps.event.trigger('resize');} catch(e){}
      });

      $rootScope = $scope; // important for map
      $rootScope.$state = $state; // for view specific css targeting
      $scope.infowindowPromise = $q.defer();
    }
  ]);
