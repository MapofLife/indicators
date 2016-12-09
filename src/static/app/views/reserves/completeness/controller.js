angular.module('mol.controllers')
  .controller('molIndicatorsCompletenessCtrl', [
    '$scope', '$state', '$window', '$timeout', 'molApi', 'molCompletenessOverlay', 'regionType', 'availableTaxa', 'mapDisplayTypes',
    function($scope, $state, $window, $timeout, molApi, molCompletenessOverlay, regionType, availableTaxa, mapDisplayTypes) {

      $scope.model.regionType = regionType;
      $scope.model.currIndicator = {};
      $scope.model.activeIndicator = 'richness';

      $scope.model.mapDisplayTypes = mapDisplayTypes;
      $scope.model.selectedMapType = mapDisplayTypes[0];

      $scope.model.availableTaxa = undefined;
      $scope.model.selectedMapTaxa = undefined;

      if ($state.params.devmode !== undefined) {
        $scope.model.devmode = $state.params.devmode;
      }

      $scope.model.map_color_classes = [
        "map-color-1",
        "map-color-1",
        "map-color-2",
        "map-color-3",
        "map-color-4",
        "map-color-5",
        "map-color-6",
        "map-color-7",
        "map-color-8",
        "map-color-9",
        "map-color-10",
        "map-color-11"
      ];
      $scope.model.selected_map_color = $scope.model.map_color_classes[0];
      $scope.model.map_color = $scope.model.map_color_classes[0];

      // $scope.$watch("model.regionType", function(n, o) {
      //   if (n.region_id) {
      //     $scope.model.regionHover = n;
      //   }
      //   if (n && !angular.equals(n, o)) {
      //     console.log('1.setRegion');
      //     console.log(o);
      //     console.log(n);
      //     $scope.setRegionType(n);
      //   }
      // }, true);

      $scope.$watch("model.selectedMapType", function(n, o) {
        if (n && !angular.equals(n, o)) {
          // if ($state.current.name == 'indicators.completeness.region') {
          //     $state.go('^');
          // }
          // $scope.getAvailableTaxaForRegion(true);
          $scope.renderMapForTaxa();
        }
      });
      $scope.$watch("model.selectedMapTaxa", function(n, o) {
        if (n && !angular.equals(n, o)) {
          $scope.renderMapForTaxa();
        }
      });
      $scope.$watch("model.activeIndicator", function(n, o) {
        if (n && !angular.equals(n, o)) {
          var params = angular.extend(regionType, {
            "taxa": $scope.model.selectedMapTaxa.taxa,
            "display_type": $scope.model.selectedMapType.type,
            "indicator": $scope.model.activeIndicator
          });
          $scope.setRegionType(params);
        }
      });

      $scope.getAvailableTaxaForRegion = function(updateMap) {
        $scope.model.availableTaxa = undefined;
        $scope.model.selectedMapTaxa = undefined;
        if ($scope.model.selectedMapType) {
          var params = {
            "region_display": $scope.model.selectedMapType.type
          };
          availableTaxa(params).then(
            function(taxa) {
              if (taxa === null) {
                $scope.model.alerts.push({
                  type: 'danger',
                  msg: 'Unable to get available species groups. <br /> <br />Please refresh the page or contact us if the problem persists.'
                });
              } else {
                var refreshMap = (updateMap || $scope.model.selectedMapTaxa != taxa[0]);
                $scope.model.availableTaxa = taxa;
                $scope.model.selectedMapTaxa = taxa[0];
                // if (refreshMap) {
                //   $scope.renderMapForTaxa();
                // }
              }
            }
          );
        }
      };

      $scope.renderMapForTaxa = function() {

        var params = angular.extend(regionType, {
          "taxa": $scope.model.selectedMapTaxa.taxa,
          "display_type": $scope.model.selectedMapType.type,
          "indicator": $scope.model.activeIndicator
        });
        $scope.setRegionType(params);
      };


      $scope.setRegionType = function(r) {
        if (r) {

          // add a timestamp to the overlay to make it really fresh.
          // this is so the cached map layers don't show through
          var params = angular.extend(r, {
            "tz": Date.now().toString()
          });

          // Let's remove the current overlay first.
          $scope.model.map.removeOverlay(0);

          molCompletenessOverlay(r).then(
            function(overlay) {
              if (overlay) {
                $scope.model.map.setOverlay(angular.extend(overlay, {
                  index: 0
                }), 0);
              } else {
                $scope.model.map.setOverlay({
                  index: 0
                }, 0);
              }
            });

          //Get metadata for features on the map
          $scope.model.map.getInfoWindowModel = function(map, eventName, latLng, data) {
            if (data) {
              switch (eventName) {
                case 'click':
                  if ( ($scope.model.activeIndicator == 'species') ||
                        ($scope.model.activeIndicator == 'richness' &&
                          $scope.model.selectedMapType.type == 'countries') ) {
                    $scope.model.selected_map_color = $scope.model.map_color_classes[data.map_color];
                    $state.transitionTo(
                      'indicators.reserves.region', {
                        "region": data.region_name
                      }, {
                        "inherit": true,
                        "reload": false
                      });
                  }
                  break;
                case 'mousemove':
                  $scope.model.regionHover = data;
                  $scope.model.map_color = $scope.model.map_color_classes[data.map_color];
                  break;
                default:
                  $scope.infowindowPromise.resolve({
                    show: false
                  });
                  $scope.infowindowPromise = $q.defer()
              }
            } else {
              $scope.infowindowPromise.resolve({
                show: false
              });
              $scope.infowindowPromise = $q.defer();
            }

            return $scope.infowindowPromise.promise;
          }

        }
      }

      $scope.getAvailableTaxaForRegion();

      // Let's do some magic.
      $timeout(500).then(function() {

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

        // trigger a window resize,
        // which in-turn triggers the map resize
        $window.dispatchEvent(new Event('resize'));
      });

    }
  ])
