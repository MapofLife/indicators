angular.module('mol.controllers').controller(
  'molIndicatorsCompletenessChartCtrl', [
                '$state','$scope','regionType','region','completenessData','$timeout',
                  'lineChart','$uibModal',
        function($state, $scope,  regionType,  region,  completenessData,  $timeout,
                   lineChart,  $uibModal) {


            $scope.model.chartObject = lineChart;
            var chartRendered = false;
            $scope.model.chartMode = 0;

            $scope.$watch("model.selectedMapTaxa", function(n,o) {
                if(n && !angular.equals(n,o)) {
                    if (chartRendered) {
                        $scope.processDataForRegionTaxa();
                    }
                }
            });

            $scope.renderChart = function (completenessData) {

                if (completenessData !== undefined) {
                    $scope.model.taxaList = completenessData.groups;
                    $scope.model.selectedTaxa = $scope.model.taxaList[0];
                    // Start the process
                    $scope.processDataForRegionTaxa();
                    chartRendered = true;
                }
            };

            $scope.processDataForRegionTaxa = function () {
                if ($scope.model.taxaList && $scope.model.selectedMapTaxa) {
                    var groupdata = $scope.model.taxaList.filter(function(r) {
                        return (r.taxa == $scope.model.selectedMapTaxa.taxa);
                    });
                    if (groupdata.length > 0) {
                        $scope.model.chartMode = 1;
                        processStatistics(groupdata[0].statistics);
                    } else {
                        $scope.model.chartMode = 2;
                        // $state.go('^');
                    }
                }
            };

            function processStatistics(stats) {
                var the_data = {};
                the_data.cols = [
                    {id: "year", label: "Year", type: "string"},
                    {id: "average", label: "Average", type: "number"},
                    {id: "i0", type: "number", role:"interval"},
                    {id: "i1", type: "number", role:"interval"}
                ];
                the_data.rows = [];
                angular.forEach(stats, function(values, key) {
                    the_data.rows.push({c: [
                        {v: values.year},
                        {v: values.average},
                        {v: getErrorValue(values.average, values.stddev, true)},
                        {v: getErrorValue(values.average, values.stddev, false)}
                    ]});
                });
                $scope.model.chartObject.data = the_data;
            }

            function getErrorValue(val, err, isMin) {
                if (isMin) {
                    var ret = (val - err);
                    return (ret < 0) ? 0 : ret;
                } else {
                    return (val + err);
                }
            }

            $scope.showModal = function() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'static/app/views/completeness/chart/main.html',
                  controller: 'molIndicatorsCompletenessChartCtrl',
                  size: 'lg',
                  resolve: {
                    $scope:$scope,
                    regionType: regionType,
                    region:region,
                    completenessData: completenessData,
                    $timeout:$timeout,
                    lineChart:lineChart,  $uibModal:null}
              });
            }


            function diddleStats() {
              try {
                angular.forEach(
                $scope.model.chartObject.data.rows,
                function(row) {
                  row.c[1].v+=row.c[1].v*(((Math.random()<0.5)? -1: 1)* Math.random()*0.20);
                  row.c[2].v=row.c[1].v-Math.random()*0.001;
                  row.c[3].v=row.c[1].v+Math.random()*0.001;
                }
              );} catch(e) {}
            }

            function chartDiddler() {
              if($scope.diddleChart) {
                  diddleStats();
                  $timeout(80).then(function(){chartDiddler()});
              }
            }
            function startDiddling() {
              $scope.diddleChart = true;
              $scope.model.chartObject.options.animation.duration=75;
              $scope.model.chartObject.options.vAxis = {
                  title: '',
                  gridlines: {
                      count: 0
                  }
              }
              chartDiddler();
            }
            function stopDiddling() {
              $scope.diddleChart = false;
              $scope.model.chartObject.options.animation.duration=1000;
               $scope.model.chartObject.options.vAxis = {
                   title: 'Species observed / expected',
                   gridlines: {
                       count: 5
                   }
               }
            }

          function updateRegion() {
              //startDiddling();
              region(regionType)
                  .then(function(r) {
                    $scope.model.region = r;
                    completenessData(r).then(
                      function(d){
                        //stopDiddling()
                        $scope.renderChart(d);
                      });
                  }
                );
          }
          updateRegion();
        }
]);
