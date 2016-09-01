angular.module('mol.controllers')
    .controller('molIndicatorsCompletenessCtrl', ['$scope', '$filter', 'molApi', 'completenessData',
        function($scope, $filter, molApi, completenessData) {

            $scope.$watch('model.country', function(n, o) {
                if (n) {
                    $scope.data = processDataForCountry(n)
                }
            });
            /* placeholder models for multiChart */
            $scope.options = {
                chart: {
                    type: 'multiChart',
                    height: 450,
                    margin: {
                        top: 30,
                        right: 60,
                        bottom: 50,
                        left: 70
                    },
                    color: d3.scale.category10().range(),
                    useInteractiveGuideline: true,
                    duration: 500,
                    xAxis: {
                        tickFormat: function(d) {
                            return d3.format('f')(d);
                        }
                    },
                    yAxis1: {
                        tickFormat: function(d) {
                            return d3.format(',.1f')(d);
                        }
                    },
                    yAxis2: {
                        tickFormat: function(d) {
                            return d3.format(',.1f')(d);
                        }
                    },
                    yAxis2: {
                        tickFormat: function(d) {
                            return d3.format(',.1f')(d);
                        }
                    }
                }
            };

            $scope.data = processDataForCountry($scope.model.country);

            function processDataForCountry(country) {
                console.log("Display data for country: " + country.name);
                var region = completenessData.filter(function(r) {
                    return (r.region == country.name);
                });
                if (region.length > 0) {
                    return processStatistics(region[0].statistics);
                }
            }

            function processStatistics(stats) {
                var nrc_data = [],
                    ngc_data = [],
                    avg_data = [],
                    std_data = [];
                angular.forEach(stats, function(values, key) {
                    nrc_data.push({
                        x: values.year,
                        y: values.no_rangemap_cells
                    });
                    ngc_data.push({
                        x: values.year,
                        y: values.no_gbif_cells
                    });
                    avg_data.push({
                        x: values.year,
                        y: values.average
                    });
                    std_data.push({
                        x: values.year,
                        y: values.stddev
                    });
                });

                return [{
                    key: 'Rangemap',
                    values: nrc_data,
                    color: '#2ecc71',
                    type: 'line',
                    yAxis: 1
                }, {
                    key: 'GBIF',
                    values: ngc_data,
                    color: '#3498db',
                    type: 'bar',
                    yAxis: 1
                }, {
                    key: 'Average',
                    values: avg_data,
                    color: '#e67e22',
                    type: 'line',
                    yAxis: 2
                }, {
                    key: 'Standard Deviation',
                    values: std_data,
                    color: '#f1c40f',
                    type: 'line',
                    yAxis: 2
                }];
            }

        }
    ]);
