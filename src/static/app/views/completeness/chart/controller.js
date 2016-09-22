angular.module('mol.controllers').controller(
  'molIndicatorsCompletenessChartCtrl', [ '$scope', 'regionType', 'region', 'completenessData',
        function($scope, regionType, region, completenessData) {

            $scope.renderChart = function (completenessData) {

                if (completenessData !== undefined) {
                    $scope.model.taxaList = completenessData.groups;
                    $scope.model.selectedTaxa = $scope.model.taxaList[0];

                    $scope.model.chartObject = {
                        type: "LineChart",
                        displayed: false,
                        options: {
                            title: "Species coverage in GBIF (Average +/- Std Err)",
                            isStacked: "true",
                            legend: 'none',
                            pointSize: 5,
                            fill: 20,
                            displayExactValues: true,
                            animation:{
                                duration: 1000,
                                easing: 'out',
                            },
                            hAxis: {
                                title: 'Year',
                                gridlines: {
                                    color: '#333',
                                    count: 10
                                }
                            },
                            vAxis: {
                                title: 'Species observed / expected',
                                gridlines: {
                                    count: 5
                                }
                            },
                            tooltip: {
                                isHtml: false
                            },
                            intervals: {style: "bars"},
                            interval: {
                                'i0': { 'color': '#bdc3c7', 'style':'bars', 'barWidth':0, 'lineWidth':2, 'pointSize':0},
                                'i1': { 'color': '#bdc3c7', 'style':'bars', 'barWidth':0, 'lineWidth':2, 'pointSize':0}
                            },
                        },
                        formatters: {},
                        view: {}
                    };

                    // Start the process
                    $scope.processDataForRegionTaxa();
                }
            };



            $scope.processDataForRegionTaxa = function () {
                var groupdata = $scope.model.taxaList.filter(function(r) {
                    return (r.taxa == $scope.model.selectedTaxa.taxa);
                });
                if (groupdata.length > 0) {
                    processStatistics(groupdata[0].statistics);
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

            region(regionType)
              .then(function(r) {
                $scope.model.region = r;
                completenessData(r).then($scope.renderChart)
              }
            );
        }
]);
