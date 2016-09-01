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
  'ui.bootstrap',
  'nvd3',
  'mol.api',
  'mol.services',
  'mol.loading-indicator',
  'mol.controllers',

])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
  }])
.config(['$httpProvider', '$locationProvider', '$sceDelegateProvider', '$urlRouterProvider', '$stateProvider',
            function($httpProvider, $locationProvider, $sceDelegateProvider, $urlRouterProvider, $stateProvider) {
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
        resolve: {
          countries: function(molApi) {
            return molApi({
              service: "spatial/regions/list",
              params: {dataset_id: "e9707baa-46e2-4ec4-99b6-86b1712e02de"}
            }).then(function(result) {
                return result.data.filter(function(r){return !r.attributes.parent_id});
            })
          },
          country: function(countries, $stateParams) {
            return $stateParams.country || countries[Math.round(Math.random()*255)];
          },
          chartData: function(country) {
            return country
          },
          completenessData: function(molApi) {
            return molApi({
              service: "indicators/completeness",
              params: {indicator: "gbif"}
            }).then(function(result) {
                return result.data.filter(function(r){return r});
            })
          }
        },
        url : ":country/"
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
            templateUrl: 'static/app/views/completeness/main.html',
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
