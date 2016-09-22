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
    cfpLoadingBarProvider.latencyThreshold = 500;
  }])
  .config(['uiGmapGoogleMapApiProvider',
    function(uiGmapGoogleMapApiProvider) {
      uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyABlkTTWW1KD6TrmFF_X6pjWrFMGgmpp9g',
        v: '3.25', //defaults to latest 3.X anyhow
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
            title: "Biodiversity Indicators",
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
            url: '/'
          }
        )
        .state(
          'indicators.about', {
            title: 'About - Biodiversity Indicators',
            views: {
              '@indicators': {
                templateUrl: 'static/app/layouts/basic.html'
              },
              'content@indicators.about': {
                templateUrl: 'static/app/views/about/main.html'
              }
            },
            url: 'about'
          }
        )
        .state(
          'indicators.contact', {
            title: 'Contact - Biodiversity Indicators',
            views: {
              '@indicators': {
                templateUrl: 'static/app/layouts/basic.html'
              },
              'content@indicators.contact': {
                templateUrl: 'static/app/views/contact/main.html'
              }
            },
            url: 'contact'
          }
        )
        .state(
          'indicators.completeness', {
            title: 'Inventory Completeness',
            views: {
              '@indicators': {
                templateUrl: 'static/app/layouts/map-with-sidebars.html'
              },
              /*'left_top_1@indicators.completeness': {
                templateUrl: 'static/app/views/completeness/controls.html',
                controller: 'molIndicatorsCompletenessCtrl'
              },*/
              'map@indicators.completeness': {
                templateUrl: 'static/app/views/completeness/map.html',
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
            url: 'completeness'
          }
        ).state(
          'indicators.completeness.region', {
            url: '/{region}',
            views: {
              'left-sidebar@indicators.completeness': {
                templateUrl: 'static/app/views/completeness/chart/main.html',
                controller: 'molIndicatorsCompletenessChartCtrl'
              }
            }
          }
        );

      $locationProvider.html5Mode(true);
    }
  ])
