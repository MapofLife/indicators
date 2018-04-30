var molServices = angular.module('mol.services', []);

molServices.factory(
    'molConfig', [
      function() {
        return {api: "1.x"}
      }
    ]
  )
  .factory(
    'molCompletenessOverlay', ['$http', '$q', '$stateParams',
      function($http, $q, $stateParams) {
        return function(params) {
          if (params) {
            var mapurl = "";
            mapurl = "https://carto.mol.org/user/mol/api/v1/map/named/indicator-species-region-taxa";
            if (params.indicator == 'richness' && params.display_type == 'geohash') {
              mapurl = "https://carto.mol.org/user/mol/api/v1/map/named/indicator-assemblage-grid-taxa";
            } else if (params.indicator == 'richness' && params.display_type == 'countries') {
              mapurl = "https://carto.mol.org/user/mol/api/v1/map/named/indicator-assemblage-region-taxa";
            }

            if ($stateParams.devmode == 'true') {
              mapurl = "https://carto.mol.org/user/mol/api/v1/map/named/indicator-species-region-taxa-dev";
              if (params.indicator == 'richness' && params.display_type == 'geohash') {
                mapurl = "https://carto.mol.org/user/mol/api/v1/map/named/indicator-assemblage-grid-taxa-dev";
              } else if (params.indicator == 'richness' && params.display_type == 'countries') {
                mapurl = "https://carto.mol.org/user/mol/api/v1/map/named/indicator-assemblage-region-taxa-dev";
              }
            }

            return $http({
              "withCredentials": false,
              "method": "POST",
              "url": mapurl,
              "data": params
            }).then(function(result, status, headers, config) {
              return {
                tile_url: "" +
                  "https://carto.mol.org/user/mol/api/v1/map/{0}/{z}/{x}/{y}.png"
                  .format(
                    result.data.layergroupid),
                grid_url: "" +
                  "https://carto.mol.org/user/mol/api/v1/map/{0}/0/{z}/{x}/{y}.grid.json"
                  .format(
                    result.data.layergroupid),
                key: result.data.layergroupid,
                attr: '©2018 Map of Life',
                name: 'region',
                opacity: 1,
                type: 'region'
              };
            });
          } else {
            return $q.when(null);
          }


        }
      }

    ])
  .factory(
    'completenessData', ['molApi', '$stateParams', function(molApi, $stateParams) {
      return function(region) {
        var devmode = ($stateParams.devmode == 'true')?true:false;
        return molApi({
          service: "indicators/completeness",
          params: {
            source: "gbif",
            indicator: region.indicator,
            region_id: region.region_id,
            devmode: devmode
          }
        }).then(function(result) {
          var completenessData = undefined;
          if (result.data.length > 0) {
            completenessData = result.data[0];
          }
          return (completenessData);
        });
      }
    }])
  .factory(
    'region', ['molApi', '$stateParams', function(molApi, $stateParams) {
      return function(regionType) {
        if (regionType.dataset_id && $stateParams.region &&
          !$stateParams.regionid) {
          return molApi({
            "service": "spatial/regions/list",
            "loading": true,
            "params": {
              "dataset_id": regionType.dataset_id
            }
          }).then(
            function(response) {
              return (response.data.find(function(region) {
                return region.name === $stateParams.region;
              }) || regionType);

            })
        } else if ($stateParams.regionid && $stateParams.region) {
          return {
            region_id: $stateParams.regionid,
            name: $stateParams.region,
            bnds: $stateParams.bounds
          }
        } else {
          return regionType
        }
      }
    }])
  .factory(
    'availableTaxa', ['molApi', '$stateParams',
      function(molApi, $stateParams) {
        var devmode = ($stateParams.devmode == 'true')?true:false;
        return function(params) {
          return molApi({
            "service": "indicators/availabletaxa",
            "loading": true,
            "params": {
              devmode: devmode
            }
          }).then(
            function(response) {
              // success response
              return (response.data || params);
            }, function(errResponse) {
              // error response
              return null;
            });
        }
      }
    ]
  )
  .factory(
    'lineChart', [function() {
      return {
        type: "LineChart",
        displayed: false,
        options: {
          isStacked: "true",
          legend: 'none',
          pointSize: 5,
          fill: 20,
          displayExactValues: true,
          animation: {
            duration: 1000,
            easing: 'out'
          },
          hAxis: {
            title: 'Year',
            gridlines: {
              color: '#333',
              count: 5
            }
          },
          vAxis: {
            title: 'Coverage (Percent \u00B1 SE)',
            gridlines: {
              count: 5
            }
          },
          tooltip: {
            isHtml: true
          },
          intervals: {
            style: "bars"
          },
          interval: {
            'i0': {
              'color': '#bdc3c7',
              'style': 'bars',
              'barWidth': 0,
              'lineWidth': 2,
              'pointSize': 0
            },
            'i1': {
              'color': '#bdc3c7',
              'style': 'bars',
              'barWidth': 0,
              'lineWidth': 2,
              'pointSize': 0
            }
          },
        },
        formatters: {},
        view: {}
      };
    }]
  )
