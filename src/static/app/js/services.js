var molServices = angular.module('mol.services', []);

molServices.factory(
  'molApiVersion', [
    function() {
       return "0.x"
     }
  ]
)
.factory(
	'molCompletenessOverlay',
	[ '$http','$q',
		function($http,$q) {
			return function(params) {
					if(params) {
            var mapurl = "https://mol.carto.com/api/v1/map/named/completeness-region-taxa";
            if (params.display_type=='geohash') {
              mapurl = "https://mol.carto.com/api/v1/map/named/completeness-grid-taxa";
            }
						return $http({
								"withCredentials":false,
								"method":"POST",
								"url":mapurl,
								"data": params
							 }).then(function(result, status, headers, config) {
											return {
													tile_url: ""+
														"https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
															.format(
																result.data.cdn_url.https,
																result.data.layergroupid),
													grid_url: "" +
														"https://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json"
															.format(
																result.data.cdn_url.https,
																result.data.layergroupid),
													key: result.data.layergroupid,
													attr: '©2016 Map of Life',
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
  	'completenessData',
    ['molApi', function(molApi) {
      return function(region) {
        return molApi({
            service: "indicators/completeness",
            params: {
              indicator: "gbif",
              region_id: region.region_id
            }
        }).then(function(result) {
          var completenessData = undefined;
          if (result.data.length > 0) {
              completenessData = result.data[0];
          }
          return(completenessData);
        });
      }
    }
])
.factory(
  'region',
  ['molApi','$stateParams',function(molApi, $stateParams) {
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
  'availableTaxa',
  [ 'molApi', '$stateParams',
  function( molApi, $stateParams) {
    return function(regionType) {
      return molApi({
        "service": "indicators/availabletaxa",
        "loading": true
      }).then(
        function(response) {
          return (response.data || regionType);
      });
    }
  }]
)
.factory(
  'lineChart',
  [function() {
    return {
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
  }]
)
