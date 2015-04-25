'use strict'

angular.module 'gtranslateApp'
.config ($stateProvider) ->
  $stateProvider.state 'statistics',
    url: '/statistics'
    templateUrl: 'app/statistics/statistics.html'
    controller: 'StatisticsCtrl'
