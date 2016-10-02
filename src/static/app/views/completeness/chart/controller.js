angular.module('mol.controllers').controller(
  'molIndicatorsCompletenessChartCtrl', [
    '$state', '$scope', '$filter', 'regionType', 'region', 'completenessData', '$timeout',
    'lineChart', '$uibModal',
    function($state, $scope, $filter, regionType, region, completenessData, $timeout,
      lineChart, $uibModal) {


      $scope.model.chartObject = lineChart;
      var chartRendered = false;
      $scope.model.chartMode = 0;

      $scope.$watch("model.selectedMapTaxa", function(n, o) {
        if (n && !angular.equals(n, o)) {
          if (chartRendered) {
            $scope.processDataForRegionTaxa();
          }
        }
      });
      $scope.$watch("model.activeIndicator", function(n, o) {
        if (n && !angular.equals(n, o)) {
          try {updateRegion();} catch (e) {}
        }
      });

      $scope.$watch("model.region",
        function(r) {
          if (r && r.bnds && r.bnds.length >= 3) {
            $timeout(500).then(function() {

              $scope.model.map.bounds = {
                southwest: {
                  latitude: r.bnds[1],
                  longitude: r.bnds[0]
                },
                northeast: {
                  latitude: r.bnds[3],
                  longitude: r.bnds[2]
                }
              };

            });
          }
        });

        $scope.resetView = function() {
          $scope.model.region = undefined;
          $state.go('^');
          // set some default bounds so
          // we can see the whole world. Kinda.
          $scope.model.map.bounds = {
            southwest: {
              latitude: -50,
              longitude: -165
            },
            northeast: {
              latitude: 50,
              longitude: 180
            }
          };
        };

      $scope.renderChart = function(completenessData) {

        if (completenessData !== undefined) {
          $scope.model.taxaList = completenessData.groups;
          // Start the process
          $scope.processDataForRegionTaxa();
          chartRendered = true;
        }
      };

      $scope.processDataForRegionTaxa = function() {
        if ($scope.model.taxaList && $scope.model.selectedMapTaxa) {
          var groupdata = $scope.model.taxaList.filter(function(r) {
            return (r.taxa == $scope.model.selectedMapTaxa.taxa);
          });
          if (groupdata.length > 0) {
            $scope.model.chartMode = 1;
            $scope.model.metrics = groupdata[0].metrics;
            $scope.model.selected_map_color = $scope.model.map_color_classes[groupdata[0].map_color];
            processStatistics(groupdata[0].values);
          } else {
            $scope.model.chartMode = 2;
            // $state.go('^');
          }
        }
      };

      function processStatistics(stats) {
        var the_data = {};
        the_data.cols = [{
          id: "year",
          label: "Year",
          type: "date"
        }, {
          id: "average",
          label: "Average",
          type: "number"
        }, {
          id: "i0",
          type: "number",
          role: "interval"
        }, {
          id: "i1",
          type: "number",
          role: "interval"
        }, {
          id: "tt",
          type: "string",
          role: "tooltip",
          p: {'html': true}
        }];
        the_data.rows = [];
        stats.sort(function(a, b) {
          var dateA=new Date(a[0], '0'), dateB=new Date(b[0], '0');
          return dateA-dateB;
        });
        angular.forEach(stats, function(yearly_values) {
          the_data.rows.push({
            c: [{
              v: new Date(yearly_values[0], "0")
            }, {
              v: (yearly_values[1] * 100)
            }, {
              v: getErrorValue( (yearly_values[1] * 100), (yearly_values[2] * 100), true)
            }, {
              v: getErrorValue( (yearly_values[1] * 100), (yearly_values[2] * 100), false)
            }, {
              v: getChartTooltip(yearly_values[0], (yearly_values[1] * 100), (yearly_values[2] * 100))
            }]
          });
        });
        $timeout(100).then(function() {
          $scope.model.chartObject.data = the_data;
        });
      }

      function getErrorValue(val, err, isMin) {
        if (isMin) {
          var ret = (val - err);
          return (ret < 0) ? 0 : ret;
        } else {
          return (val + err);
        }
      }

      function getChartTooltip(year, val, err) {
        var ttstr = "";
        ttstr += "<div style='text-align: left; padding: 10px;font-size: bigger;'>";
        ttstr += "<strong>Year: </strong>" + year;
        ttstr += "<br />";
        ttstr += "<strong>Average: </strong>: " + $filter('numberEx')(val, 2) + "% ";
        ttstr += " ( &#x00B1;" + $filter('numberEx')(err, 2) + " ) &nbsp;" ;
        ttstr += "</div>";

        return ttstr;
      }

      $scope.showModal = function() {
        var chartModal = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'static/app/views/completeness/chart/main-modal.html',
          controller: 'ModalInstanceCtrl',
          controllerAs: '$ctrl',
          size: 'lg',
          resolve: {
            $scope: $scope
          }
        });
        chartModal.result.then(function() {}, function() {
          // reset the hAxis count
          $scope.model.chartObject.options.hAxis.gridlines.count = 5;
        });
      }


      function diddleStats() {
        try {
          angular.forEach(
            $scope.model.chartObject.data.rows,
            function(row) {
              row.c[1].v += row.c[1].v * (((Math.random() < 0.5) ? -1 : 1) * Math.random() * 0.20);
              row.c[2].v = row.c[1].v - Math.random() * 0.001;
              row.c[3].v = row.c[1].v + Math.random() * 0.001;
            }
          );
        } catch (e) {}
      }

      function chartDiddler() {
        if ($scope.diddleChart) {
          diddleStats();
          $timeout(80).then(function() {
            chartDiddler()
          });
        }
      }

      function startDiddling() {
        $scope.diddleChart = true;
        $scope.model.chartObject.options.animation.duration = 75;
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
        $scope.model.chartObject.options.animation.duration = 1000;
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
            r.indicator = $scope.model.activeIndicator;
            completenessData(r).then(
              function(d) {
                //stopDiddling()
                $scope.renderChart(d);
              });
          });
      }
      try {updateRegion();} catch (e) {}
    }
  ]);
angular.module('mol.controllers').controller('ModalInstanceCtrl', ['$uibModalInstance', '$scope', '$timeout',
  function($uibModalInstance, $scope, $timeout) {
    var $ctrl = this;

    $ctrl.the_region = $scope.model.region;
    $ctrl.the_taxa = $scope.model.selectedMapTaxa;
    $timeout(500).then(function() {
      // expand the hAxis count so looks better when wider
      $ctrl.the_chartObject = $scope.model.chartObject;
      $ctrl.the_chartObject.options.hAxis.gridlines.count = 15;
    });

    $ctrl.close = function() {
      $uibModalInstance.dismiss('cancel');
    }
  }
]);
