angular.module('mol.controllers')
    .controller('molIndicatorsCompletenessCtrl', ['$scope', '$state', '$rootScope', '$filter', '$uibModal', 'uiGmapGoogleMapApi', 'molApi', 'molRegionOverlay', 'region', 'regionType', 
        function($scope, $state, $rootScope, $filter, $uibModal, uiGmapGoogleMapApi, molApi, molRegionOverlay, region, regionType) {

            $scope.model.region = region;
            $scope.model.regionType = regionType;

            $scope.$watch("model.region", function(n,o) {
                console.log(n);
                if (n.region_id) {
                    $scope.model.regionHover = n;
                    loadModalForRegion(n);
                }
                if(n && !angular.equals(n,o)) {
                    $scope.setRegion(n);
                }
            },true);


            $scope.setRegion = function(r) {
                if(r) {
                    molRegionOverlay(r).then(
                        function(overlay) {
                            if(overlay) {
                                $scope.model.map.setOverlay(angular.extend(overlay,{index:0}),0);
                            } else {
                                $scope.model.map.setOverlay({index:0},0);
                            }
                            if(r.bnds) {
                                $scope.model.map.bounds = {
                                    southwest: {latitude: r.bnds[1],longitude: r.bnds[0]},
                                    northeast: {latitude: r.bnds[3],longitude: r.bnds[2]}
                                };
                            } else {
                                $scope.model.map.zoom = 2;
                            }
                        });

                        //Get metdata for features on the map
                        $scope.model.map.getInfoWindowModel = function(map, eventName, latLng, data) {
                            if(data) {
                                switch(eventName) {
                                    case 'click':
                                        var bnds = data.bnds = data.bnds.split(',')
                                            .map(function(n){return parseFloat(n);});

                                        if(bnds) {
                                            $scope.model.map.bounds = {
                                                southwest: {latitude: bnds[1],longitude: bnds[0]},
                                                northeast: {latitude: bnds[3],longitude: bnds[2]}
                                            };
                                        }

                                        $state.transitionTo(
                                            $state.current.name,
                                            {"region":data.name},
                                            {"inherit":true, "relative": $state.current, "notify": false});

                                        loadModalForRegion(data);

                                        //$scope.region = data;
                                        //$scope.infowindowPromise.resolve({show:false});
                                        //$scope.infowindowPromise = $q.defer();
                                        break;
                                    case 'mousemove':
                                        $scope.model.regionHover = data;
                                        break;
                                    default:
                                        $scope.infowindowPromise.resolve({show:false});
                                        $scope.infowindowPromise = $q.defer()
                                }
                            } else {
                                $scope.infowindowPromise.resolve({show: false});
                                $scope.infowindowPromise = $q.defer() ;
                            }
                            
                            return $scope.infowindowPromise.promise;
                        }

                }
            }

            $scope.setRegion($scope.model.region); 

            function loadModalForRegion(region) {
                return molApi({
                  service: "indicators/completeness",
                  params: {
                    indicator: "gbif",
                    region_id: region.region_id
                }
                }).then(function(result) {
                    // return result.data.filter(function(r){return r});

                    var completenessData = undefined;
                    if (result.data.length > 0) {
                        completenessData = result.data[0];
                    }

                    var modalInstance = $uibModal.open({
                      animation: true,
                      ariaLabelledBy: 'modal-title',
                      ariaDescribedBy: 'modal-body',
                      templateUrl: 'statsModalContent.html',
                      controller: 'ModalInstanceCtrl',
                      controllerAs: '$ctrl',
                      size: 'lg',
                      resolve: {
                        $scope: $scope,
                        region: region,
                        completenessData: completenessData
                      }
                    });
                    modalInstance.result.then(function () {
                            // empty CLOSE block
                        }, function () {
                            // we do all the work in the DISMISS block
                            console.log('Reloading regions');
                            $state.go($state.current.name, {}, {"inherit":false});
                        });

                });
            }

        }
    ])
.controller('ModalInstanceCtrl', ['$uibModalInstance', '$scope', 'region', 'completenessData', 
        function($uibModalInstance, $scope, region, completenessData) {
            var $ctrl = this;

            $ctrl.taxalist = undefined;
            $ctrl.selectedtaxa = undefined;

            $ctrl.init = function () {
                $ctrl.region = region;
                if (completenessData !== undefined) {
                    $ctrl.taxalist = completenessData.groups;
                    $ctrl.selectedtaxa = $ctrl.taxalist[0];

                    $ctrl.chartObject = {
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
                                slantedText: 'false',
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
                    $ctrl.processDataForRegionTaxa();
                }
            };

            $ctrl.reset = function () {
                $uibModalInstance.dismiss('reset');
            };

            $ctrl.processDataForRegionTaxa = function () {
                var groupdata = $ctrl.taxalist.filter(function(r) {
                    return (r.taxa == $ctrl.selectedtaxa.taxa);
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
                $ctrl.chartObject.data = the_data;
            }

            function getErrorValue(val, err, isMin) {
                if (isMin) {
                    var ret = (val - err);
                    return (ret < 0) ? 0 : ret;
                } else {
                    return (val + err);
                }
            }

            $ctrl.init();
        }
]);
