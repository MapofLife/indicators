'use strict';

angular.module('mol.controllers', []);

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
    cfpLoadingBarProvider.latencyThreshold = 50;
  }])
  .config(['uiGmapGoogleMapApiProvider',
    function(uiGmapGoogleMapApiProvider) {
      uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyABlkTTWW1KD6TrmFF_X6pjWrFMGgmpp9g',
        v: '3', //defaults to latest 3.X anyhow
        libraries: 'geometry,visualization,drawing',
        language: 'en'

      });
    }
  ])
  .config(['$httpProvider', '$locationProvider', '$sceDelegateProvider', '$urlRouterProvider', '$stateProvider',
    function($httpProvider, $locationProvider, $sceDelegateProvider, $urlRouterProvider, $stateProvider) {

      var params = "" +
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
            title: "Indicators",
            views: {
              '': {
                templateUrl: 'static/app/layouts/base.html',
                controller: 'molIndicatorsCtrl'
              },
              '@indicators': {
                templateUrl: 'static/app/layouts/basic.html'
              },
              'nav@indicators': {
                templateUrl: 'static/app/views/sub-nav-empty.html'
              },
              'content@indicators': {
                templateUrl: 'static/app/views/main.html'
              }
            },
            url: '/'
          }
        )
        .state(
          'indicators.coverage.background', {
            title: 'Species Data Coverage',
            views: {
              '@indicators': {
                templateUrl: 'static/app/layouts/basic.html'
              },
              'nav@indicators': {
                templateUrl: 'static/app/views/coverage/sub-nav.html'
              },
              'content@indicators.coverage.background': {
                templateUrl: 'static/app/views/coverage/background.html'
              }
            },
            url: '/background'
          }
        )
        .state(
          'indicators.coverage.sources', {
            title: 'Species Data Coverage',
            views: {
              '@indicators': {
                templateUrl: 'static/app/layouts/basic.html'
              },
              'nav@indicators': {
                templateUrl: 'static/app/views/coverage/sub-nav.html'
              },
              'content@indicators.coverage.sources': {
                templateUrl: 'static/app/views/coverage/sources.html'
              }
            },
            url: '/sources'
          }
        )
        .state(
          'indicators.coverage.team', {
            title: 'Species Data Coverage',
            views: {
              '@indicators': {
                templateUrl: 'static/app/layouts/basic.html'
              },
              'nav@indicators': {
                templateUrl: 'static/app/views/coverage/sub-nav.html'
              },
              'content@indicators.coverage.team': {
                templateUrl: 'static/app/views/coverage/team.html'
              }
            },
            url: '/team'
          }
        )
        .state(
          'indicators.coverage', {
            title: 'Species Data Coverage',
            sticky: true,
            views: {
              '@indicators': {
                templateUrl: 'static/app/layouts/map-with-sidebars.html'
              },
              'nav@indicators': {
                templateUrl: 'static/app/views/coverage/sub-nav.html'
              },
              /*'left_top_1@indicators.coverage': {
                templateUrl: 'static/app/views/completeness/controls.html',
                controller: 'molIndicatorsCompletenessCtrl'
              },*/
              'right-sidebar@indicators.coverage': {
                templateUrl: 'static/app/views/coverage/completeness/chart/main.html'
              },
              'map@indicators.coverage': {
                templateUrl: 'static/app/views/coverage/completeness/map.html',
                controller: 'molIndicatorsCompletenessCtrl'
              }
            },
            resolve: {
              regionType: function(molApi, $stateParams) {
                var defaultType = ($stateParams.regiontype || 'countries');
                return [{
                    "dataset_id": "e9707baa-46e2-4ec4-99b6-86b1712e02de",
                    "citation": "Global Administrative Areas. (2016). GADM database of Global Administrative Areas, version 2.8. http://www.gadm.org.",
                    "type": "countries",
                    "dataset_title": "Global Administrative Areas v 2.8",
                    "title": "Political boundaries"
                  }]
                  .find(function(type) {
                    return type.type.toLowerCase() === defaultType
                  });
              },
              mapDisplayTypes: function() {
                  return[{
                    "type": "countries",
                    "title": "Countries"
                  }, {
                    "type": "geohash",
                    "title": "Grid"
                  }];
              }
            },
            url: 'coverage?devmode'
          }
        ).state(
          'indicators.coverage.region', {
            url: '/{region}',
            views: {
              'right-sidebar@indicators.coverage': {
                templateUrl: 'static/app/views/coverage/completeness/chart/main.html',
                controller: 'molIndicatorsCompletenessChartCtrl'
              }
            }
          }
        )
        .state(
          'indicators.reserves', {
            title: 'Species Protection',
            sticky: true,
            views: {
              '@indicators': {
                templateUrl: 'static/app/layouts/map-with-sidebars.html'
              },
              'nav@indicators': {
                templateUrl: 'static/app/views/reserves/sub-nav.html'
              },
              'right-sidebar@indicators.reserves': {
                templateUrl: 'static/app/views/reserves/completeness/chart/main.html'
              },
              'map@indicators.reserves': {
                templateUrl: 'static/app/views/reserves/completeness/map.html',
                controller: 'molIndicatorsmolIndicatorsCtrl'
              }
            },
            resolve: {
              regionType: function(molApi, $stateParams) {
                var defaultType = ($stateParams.regiontype || 'countries');
                return [{
                    "dataset_id": "e9707baa-46e2-4ec4-99b6-86b1712e02de",
                    "citation": "Global Administrative Areas. (2016). GADM database of Global Administrative Areas, version 2.8. http://www.gadm.org.",
                    "type": "countries",
                    "dataset_title": "Global Administrative Areas v 2.8",
                    "title": "Political boundaries"
                  }]
                  .find(function(type) {
                    return type.type.toLowerCase() === defaultType
                  });
              },
              mapDisplayTypes: function() {
                  return[{
                    "type": "countries",
                    "title": "Countries"
                  }, {
                    "type": "geohash",
                    "title": "Grid"
                  }];
              }
            },
            url: 'reserves?devmode'
          }
        )
        .state(
          'indicators.reserves.background', {
            title: 'Species Protection',
            views: {
              '@indicators': {
                templateUrl: 'static/app/layouts/basic.html'
              },
              'nav@indicators': {
                templateUrl: 'static/app/views/reserves/sub-nav.html'
              },
              'content@indicators.reserves.background': {
                templateUrl: 'static/app/views/reserves/background.html'
              }
            },
            url: '/background'
          }
        )
        .state(
          'indicators.reserves.region', {
            url: '/{region}',
            views: {
              'right-sidebar@indicators.reserves': {
                templateUrl: 'static/app/views/reserves/completeness/chart/main.html',
                controller: 'molIndicatorsReservesChartCtrl'
              }
            }
          }
        );

      $locationProvider.html5Mode(true);
    }
  ])
