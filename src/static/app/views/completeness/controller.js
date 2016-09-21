angular.module('mol.controllers')
    .controller('molIndicatorsCompletenessCtrl', [
            '$scope','$state','molApi','molRegionOverlay','regionType',
    function($scope,  $state,  molApi,  molRegionOverlay,  regionType) {

            $scope.model.regionType = regionType;
            $scope.model.selectedTaxa = undefined;

            $scope.$watch("model.regionType", function(n,o) {
                console.log(n);
                if (n.region_id) {
                    $scope.model.regionHover = n;
                }
                if(n && !angular.equals(n,o)) {
                    $scope.setRegionType(n);
                }
            },true);


            $scope.setRegionType = function(r) {
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

                        //Get metadata for features on the map
                        $scope.model.map.getInfoWindowModel = function(map, eventName, latLng, data) {
                            if(data) {
                                switch(eventName) {
                                    case 'click':
                                        $state.transitionTo(
                                            'indicators.completeness.region',
                                            {"region":data.name},{"inherit":true});
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
