angular.module('mol.controllers')
    .controller('molIndicatorsCompletenessCtrl', [
            '$scope','$state','molApi','molCompletenessOverlay','regionType','availableTaxa','mapDisplayTypes',
    function($scope,  $state,  molApi,  molCompletenessOverlay,  regionType, availableTaxa, mapDisplayTypes) {

            $scope.model.regionType = regionType;

            $scope.model.mapDisplayTypes = mapDisplayTypes;
            $scope.model.selectedMapType = mapDisplayTypes[0];

            $scope.model.availableTaxa = undefined;
            availableTaxa(regionType).then(
              function(taxa) {$scope.model.availableTaxa = taxa;}
            );
            $scope.model.selectedMapTaxa = availableTaxa[0];

            $scope.$watch("model.regionType", function(n,o) {
                if (n.region_id) {
                    $scope.model.regionHover = n;
                }
                if(n && !angular.equals(n,o)) {
                    $scope.setRegionType(n);
                }
            },true);

            $scope.$watch("model.selectedMapType", function(n,o) {
                if(n && !angular.equals(n,o)) {
                    return molApi({
                      "service": "indicators/availabletaxa",
                      "loading": true,
                      "params": {
                        "region_display": n.type
                      }
                    }).then(
                      function(response) {
                        var refreshMap = ($scope.model.selectedMapTaxa != response.data[0]);
                        $scope.model.availableTaxa = response.data;
                        $scope.model.selectedMapTaxa = response.data[0];
                        if (refreshMap) {
                          $scope.renderMapForTaxa();
                        }
                    });
                }
            });
            $scope.$watch("model.selectedMapTaxa", function(n,o) {
                if(n && !angular.equals(n,o)) {
                    $scope.renderMapForTaxa();
                }
            });

            $scope.renderMapForTaxa = function() {
                var params = angular.extend(regionType, {
                  "taxa": $scope.model.selectedMapTaxa.taxa,
                  "display_type": $scope.model.selectedMapType.type
                });
                $scope.setRegionType(params);
            };


            $scope.setRegionType = function(r) {
                if(r) {
                    molCompletenessOverlay(r).then(
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

                        //Get metadata for features on the map
                        $scope.model.map.getInfoWindowModel = function(map, eventName, latLng, data) {
                            if(data) {
                                switch(eventName) {
                                    case 'click':
                                        if ($scope.model.selectedMapType.type=='countries') {
                                            $state.transitionTo(
                                                'indicators.completeness.region',
                                                {"region":data.region_name},{
                                                  "inherit":true,"reload":false});
                                        }
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

            $scope.setRegionType($scope.model.regionType);


        }
    ])
