angular.module('mol.controllers')
  .controller('molIndicatorsReservesCtrl', ['$scope', 'molApi',
    function($scope,  molApi) {

      $scope.$watch('model.country',function(n,o){
          if(n){$scope.data = generateData(n)}
      });

      $scope.options = {
             chart: {
                 type: 'pieChart',
                 height: 800,
                 x: function(d){return d.key;},
                 y: function(d){return d.y;},
                 showLabels: true,
                 duration: 1500,
                 labelThreshold: 0.01,
                 labelSunbeamLayout: true,
                 legend: {
                     margin: {
                         top: 5,
                         right: 35,
                         bottom: 5,
                         left: 0
                     }
                 }
             }
         };

         $scope.data = generateData()

         function generateData (){ return [
             {
                 key: "Strict Reserves",
                 y: 100*Math.random()
             },
             {
                 key: "Loose Reserves",
                 y: 100*Math.random()
             },
             {
                 key: "Unprotected",
                 y: 100*Math.random()
             },
             {
                 key: "Scorched Earth",
                 y: 100*Math.random()
             }
         ];}
    }
  ]);
