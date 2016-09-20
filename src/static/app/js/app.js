'use strict';

angular.module('mol.controllers',[]);

angular.module('mol.indicators', [
  'ui.router',
  'angular-loading-bar',
  'angular.filter',
  'ngResource',
  'ngSanitize',
  'ngCookies',
  'ngAnimate',
  'ct.ui.router.extras',
  'ui.bootstrap',
  'uiGmapgoogle-maps',
  'googlechart',
  'mol.api',
  'mol.ui-map',
  'mol.services',
  'mol.loading-indicator',
  'mol.controllers'
])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
  }])
.config(['uiGmapGoogleMapApiProvider',
  function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyABlkTTWW1KD6TrmFF_X6pjWrFMGgmpp9g',
        v: '3.25', //defaults to latest 3.X anyhow
        libraries: 'geometry,visualization,drawing',
        language:'en'

    });
}])
.config(['$httpProvider', '$locationProvider', '$sceDelegateProvider', '$urlRouterProvider', '$stateProvider',
            function($httpProvider, $locationProvider, $sceDelegateProvider, $urlRouterProvider, $stateProvider) {

              var params = ""+
    "regiontype&region&regionid&dsid&type&bounds&" + //selected data options
    "embed&sidebar&header&subnav&footer&speciessearch&regionsearch";

  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.withCredentials = false;
  $locationProvider.html5Mode(true);
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http:*//localhost**',
    'http*://127.0.0.1:9001/**',
    'http*://*mol.org/**',
    'http*://mapoflife.github.io/**',
  ]);
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state(
      'indicators', {
        title: "Biodiversity Indicators",
        deepStateRedirect: true,
        sticky: true,
        views: {
          '': {
            templateUrl: 'static/app/layouts/base.html',
            controller: 'molIndicatorsCtrl'
          },
          '@indicators': {
            templateUrl: 'static/app/layouts/basic.html'
          },
          'content@indicators': {
            templateUrl: 'static/app/views/main.html'
          }
        },
        resolve: {
          regionType: function(molApi, $stateParams) {
                  /*return molApi({
                    "service" : "spatial/regions/types"
                  }).then(function(response) {
                    var defaultType = ($stateParams.regiontype || 'global');
                    return response.data.find(function(type) {
                      return type.type.toLowerCase() === defaultType
                    });
                  })*/
                  var defaultType = ($stateParams.regiontype || 'countries');
                  return [
                    {"dataset_id": "3fc08de0-49e9-479d-95f4-42b2ad82f3bf", "citation": "IUCN and UNEP-WCMC (2016), The World Database on Protected Areas (WDPA), February 2016, Cambridge, UK: UNEP-WCMC. Available at: www.protectedplanet.net.", "type": "national_parks", "dataset_title": "National Parks", "title": "National Parks"}, {"dataset_id": "e9707baa-46e2-4ec4-99b6-86b1712e02de", "citation": "Global Administrative Areas. (2016). GADM database of Global Administrative Areas, version 2.8. http://www.gadm.org.", "type": "countries", "dataset_title": "Global Administrative Areas v 2.8", "title": "Political boundaries"}, {"dataset_id": "1603cb8b-918c-40ac-8732-ff0c20e1ed19", "citation": "TBA", "type": "mountains", "dataset_title": "Mountain Ranges", "title": "Mountain Ranges"}]
                      .find(function(type) {
                        return type.type.toLowerCase() === defaultType
                      });
          },
          region: function(regionType, molApi, $stateParams) {
                  if(regionType.dataset_id && $stateParams.region && !$stateParams.regionid) {
                    return molApi({
                      "service" : "spatial/regions/list",
                      "loading" :true,
                      "params" : {
                        "dataset_id": regionType.dataset_id}
                    }).then(
                      function(response){
                      return (response.data.find(function(region){
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
                  };
            }
        },
        url : ":country/?{0}".format(params)
      }
    )
    .state(
      'indicators.completeness', {
        title: 'Inventory Completeness',
        views: {
          '@indicators': {
            templateUrl: 'static/app/layouts/basic.html'
          },
          'content@indicators.completeness': {
            templateUrl: 'static/app/views/completeness/main-with-map.html',
            controller: 'molIndicatorsCompletenessCtrl'
          }
        },

        url: 'completeness'
      }
    )
    .state(
      'indicators.reserves', {
        title: 'Reserve Coverage',
        views: {
          '@indicators': {
            templateUrl: 'static/app/layouts/basic.html'
          },
          'content@indicators.reserves': {
            templateUrl: 'static/app/views/reserves/main.html',
            controller: 'molIndicatorsReservesCtrl'
          }
        },

        url: 'reserves'
      }
    )
    .state(
      'indicators.habitat', {
        title: 'Habitat Change',
        views: {
          '@indicators': {
            templateUrl: 'static/app/layouts/basic.html'
          },
          'content@indicators.habitat': {
            templateUrl: 'static/app/views/habitat/main.html',
            controller: 'molIndicatorsHabitatCtrl'
          }
        },

        url: 'habitat'
      }
    )

    $locationProvider.html5Mode(true);
}])
