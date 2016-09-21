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

	]);
