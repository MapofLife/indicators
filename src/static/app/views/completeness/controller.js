angular.module('mol.controllers')
    .controller('molIndicatorsCompletenessCtrl', [
            '$scope','$state','molApi','molCompletenessOverlay','regionType','availableTaxa','mapDisplayTypes',
    function($scope,  $state,  molApi,  molCompletenessOverlay,  regionType, availableTaxa, mapDisplayTypes) {

            $scope.model.regionType = regionType;

            $scope.model.mapDisplayTypes = mapDisplayTypes;
            $scope.model.selectedMapType = mapDisplayTypes[0];

            $scope.model.availableTaxa = undefined;
            $scope.model.selectedMapTaxa = undefined;

            $scope.model.map_colour_classes = [
              "map-colour-1",
              "map-colour-2",
              "map-colour-3",
              "map-colour-4",
              "map-colour-5",
              "map-colour-6",
              "map-colour-7"
            ];
            $scope.model.map_colour = $scope.model.map_colour_classes[0];

            var isMapLoading = false;

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
                  if ($state.current.name == 'indicators.completeness.region') {
                      $state.go('^');
                  }
                  $scope.getAvailableTaxaForRegion(true);
                }
            });
            $scope.$watch("model.selectedMapTaxa", function(n,o) {
                if(n && !angular.equals(n,o)) {
                    $scope.renderMapForTaxa();
                }
            });

            $scope.getAvailableTaxaForRegion = function(updateMap) {
              $scope.model.availableTaxa = undefined;
              $scope.model.selectedMapTaxa = undefined;
              if ($scope.model.selectedMapType) {
                var params = {"region_display": $scope.model.selectedMapType.type};
                availableTaxa(params).then(
                  function(taxa) {
                    var refreshMap = (updateMap || $scope.model.selectedMapTaxa != taxa[0]);
                    $scope.model.availableTaxa = taxa;
                    $scope.model.selectedMapTaxa = taxa[0];
                    if (refreshMap) {
                      $scope.renderMapForTaxa();
                    }
                  }
                );
              }
            };

            $scope.renderMapForTaxa = function() {

                if (isMapLoading) return;

                isMapLoading = true;
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


                            isMapLoading = false;
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
                                        $scope.model.map_colour = $scope.model.map_colour_classes[data.map_color];
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

            $scope.getAvailableTaxaForRegion();


        }
    ])
